#!/usr/bin/env python3
"""グラレコ VSL 一括画像生成パイプライン

1. NanoBanana Pro でグラレコ風画像を生成（台本内容を視覚で伝える）
2. japanese-text-verifier でテキスト品質チェック（警告のみ）
3. Pillow で正確な日本語テロップをオーバーレイ
4. agentic-vision で品質チェック（オプション）
5. 生成失敗 → リトライ（最大3回）
6. 完成 → public/images/scenes/ に配置

使い方:
  python3 scripts/batch-generate-graphrec.py
  python3 scripts/batch-generate-graphrec.py --scene s01-hook   # 1シーンだけ
  python3 scripts/batch-generate-graphrec.py --dry-run           # プレビューのみ
  python3 scripts/batch-generate-graphrec.py --start-from s03    # 途中から再開
  python3 scripts/batch-generate-graphrec.py --skip-verify       # 検証スキップ
  python3 scripts/batch-generate-graphrec.py --overlay-only      # オーバーレイのみ(背景済)
"""

import argparse
import json
import os
import subprocess
import sys
import time

# パスを設定
SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPTS_DIR)

from graphrec_config import GRAPHREC_SCENE_IMAGES, get_theme_for_scene
from graphrec_overlay import overlay_graphrec_text

NANOBANANA_DIR = os.path.expanduser("~/.claude/skills/nanobanana-pro")
VERIFIER_DIR = os.path.expanduser("~/.claude/skills/japanese-text-verifier/scripts")
VISION_DIR = os.path.expanduser("~/.claude/skills/agentic-vision/scripts")

OUTPUT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "public", "images", "scenes"
)
BG_DIR = os.path.join(OUTPUT_DIR, "_backgrounds")

MAX_RETRIES = 3


def generate_background(prompt, output_path, timeout=240):
    """NanoBanana Pro でグラレコ風画像を生成"""
    cmd = [
        sys.executable,
        os.path.join(NANOBANANA_DIR, "scripts", "run.py"),
        "image_generator.py",
        "--prompt", prompt,
        "--output", output_path,
        "--timeout", str(timeout),
    ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout + 60,
            cwd=NANOBANANA_DIR,
        )
        if result.returncode == 0 and os.path.exists(output_path):
            size = os.path.getsize(output_path)
            if size > 5000:
                return True
            print(f"    [bg] File too small: {size}B", flush=True)
            return False
        print(f"    [bg] Generation failed (rc={result.returncode})", flush=True)
        if result.stderr:
            print(f"    [bg] stderr: {result.stderr[:200]}", flush=True)
        return False
    except subprocess.TimeoutExpired:
        print("    [bg] Timeout", flush=True)
        return False
    except Exception as e:
        print(f"    [bg] Error: {e}", flush=True)
        return False


def verify_text_quality(image_path):
    """japanese-text-verifier で画像内テキストの品質を確認（警告のみ）

    画像にテキストが含まれること自体は問題ない。
    ガベージ（デタラメ文字）が含まれていれば警告する。

    Returns:
        (is_ok, extracted_text)
    """
    original_path = sys.path.copy()
    try:
        sys.path.insert(0, VERIFIER_DIR)

        from slide_verifier import BackgroundVerifier
        verifier = BackgroundVerifier(max_retries=0)
        result = verifier.verify_background(image_path)

        if result.is_clean:
            return True, ""

        extracted = result.extracted_text
        has_japanese = any(
            "\u3041" <= ch <= "\u3096"  # ひらがな
            or "\u30a1" <= ch <= "\u30fa"  # カタカナ
            or "\u4e00" <= ch <= "\u9fff"  # CJK漢字
            for ch in extracted
        )

        if has_japanese or len(extracted) < 3:
            return True, extracted

        # 日本語が含まれない長いテキスト → ガベージの可能性（警告用）
        return False, extracted
    except ImportError:
        print("    [verify] japanese-text-verifier not available, skipping", flush=True)
        return True, ""
    except Exception as e:
        print(f"    [verify] Error: {e}", flush=True)
        return True, ""
    finally:
        sys.path = original_path


def run_vision_qa(image_path):
    """agentic-vision で品質チェック（オプション）

    Returns:
        (passed, details)
    """
    original_path = sys.path.copy()
    try:
        sys.path.insert(0, VISION_DIR)

        from agentic_vision import AgenticVisionAnalyzer, AnalysisType
        analyzer = AgenticVisionAnalyzer()

        if analyzer.client is None:
            print("    [vision] No GEMINI_API_KEY, skipping QA", flush=True)
            return True, "skipped"

        result = analyzer.analyze(
            image_path,
            analysis_type=AnalysisType.QUALITY,
        )

        quality = result.results.get("quality_score", 0)
        passed = quality >= 60
        return passed, f"quality={quality}"
    except ImportError:
        print("    [vision] agentic-vision not available, skipping", flush=True)
        return True, "skipped"
    except Exception as e:
        print(f"    [vision] Error: {e}", flush=True)
        return True, "error"
    finally:
        sys.path = original_path


def process_one_image(
    scene_id, index, bg_prompt, overlay_text,
    dry_run=False, force=False, skip_verify=False, overlay_only=False,
    skip_vision=True,
):
    """1枚の画像を処理する完全パイプライン

    Returns: "ok" | "skip" | "fail" | "dry" | "timeout"
    """
    filename = f"{scene_id}_{index}.png"
    final_path = os.path.join(OUTPUT_DIR, filename)
    bg_filename = f"{scene_id}_{index}_bg.png"
    bg_path = os.path.join(BG_DIR, bg_filename)

    theme = get_theme_for_scene(scene_id)

    # 既存チェック
    if os.path.exists(final_path) and not force and not overlay_only:
        size = os.path.getsize(final_path)
        if size > 10000:
            print(f"  SKIP: {filename} (exists, {size // 1024}KB)", flush=True)
            return "skip"

    if dry_run:
        print(f"  DRY-RUN: {filename}", flush=True)
        print(f"    BG prompt: {bg_prompt[:80]}...", flush=True)
        print(f"    Overlay: {overlay_text}", flush=True)
        return "dry"

    print(f"  PROCESSING: {filename}", flush=True)

    # ===== Phase 1: 背景生成 =====
    if overlay_only and os.path.exists(bg_path):
        print(f"    [bg] Using existing background", flush=True)
    else:
        os.makedirs(BG_DIR, exist_ok=True)

        for attempt in range(MAX_RETRIES + 1):
            enhanced_prompt = bg_prompt
            if attempt > 0:
                jp_reinforce_suffixes = [
                    ", ensure all visible text is in correct accurate Japanese",
                    ", Japanese text must be legible and correctly spelled",
                    ", text elements should display exact Japanese characters as specified",
                ]
                suffix_idx = min(attempt - 1, len(jp_reinforce_suffixes) - 1)
                enhanced_prompt = bg_prompt + jp_reinforce_suffixes[suffix_idx]

            print(f"    [bg] Generating (attempt {attempt + 1}/{MAX_RETRIES + 1})...", flush=True)
            success = generate_background(enhanced_prompt, bg_path)

            if not success:
                if attempt < MAX_RETRIES:
                    print(f"    [bg] Retrying...", flush=True)
                    time.sleep(3)
                    continue
                print(f"  FAIL: {filename} (generation failed)", flush=True)
                return "fail"

            # ===== Phase 2: テキスト品質チェック（警告のみ） =====
            if not skip_verify:
                is_ok, extracted = verify_text_quality(bg_path)
                if is_ok:
                    if extracted:
                        print(f"    [verify] Japanese text OK: '{extracted[:40]}'", flush=True)
                    else:
                        print(f"    [verify] No text detected", flush=True)
                    break
                print(f"    [verify] Garbled text detected: '{extracted[:40]}'", flush=True)
                if attempt < MAX_RETRIES:
                    print(f"    [verify] Retrying with Japanese reinforcement...", flush=True)
                    time.sleep(2)
                    continue
                print(f"    [verify] Max retries reached, proceeding (overlay will fix)", flush=True)
                break
            else:
                break

    # ===== Phase 3: Pillow テキストオーバーレイ =====
    if not os.path.exists(bg_path):
        print(f"  FAIL: {filename} (no background image)", flush=True)
        return "fail"
    print(f"    [overlay] Applying text: {overlay_text}", flush=True)
    try:
        overlay_graphrec_text(bg_path, final_path, overlay_text, theme=theme)
    except Exception as e:
        print(f"  FAIL: {filename} (overlay error: {e})", flush=True)
        return "fail"

    # ===== Phase 4: Vision QA (オプション) =====
    if not skip_vision:
        passed, details = run_vision_qa(final_path)
        if not passed:
            print(f"    [vision] QA failed: {details}", flush=True)
        else:
            print(f"    [vision] QA passed: {details}", flush=True)

    size = os.path.getsize(final_path)
    print(f"  OK: {filename} ({size // 1024}KB)", flush=True)
    return "ok"


def main():
    parser = argparse.ArgumentParser(
        description="グラレコ VSL batch image generator with text overlay"
    )
    parser.add_argument("--scene", help="Generate for a specific scene only")
    parser.add_argument("--start-from", help="Start from this scene ID")
    parser.add_argument("--dry-run", action="store_true", help="Preview only")
    parser.add_argument("--force", action="store_true", help="Regenerate even if file exists")
    parser.add_argument("--skip-verify", action="store_true", help="Skip text verification")
    parser.add_argument("--overlay-only", action="store_true",
                        help="Only apply text overlay (backgrounds already exist)")
    parser.add_argument("--with-vision", action="store_true",
                        help="Enable agentic-vision QA (slower)")
    parser.add_argument("--report", help="Save generation report to JSON file")
    args = parser.parse_args()

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    images = list(GRAPHREC_SCENE_IMAGES)

    if args.scene:
        images = [item for item in images if item[0] == args.scene]
    if args.start_from:
        start_idx = next(
            (idx for idx, item in enumerate(images) if item[0].startswith(args.start_from)),
            0
        )
        images = images[start_idx:]

    total = len(images)
    skip_vision = not args.with_vision

    print(f"\n{'=' * 60}", flush=True)
    print(f"Graphrec VSL Batch Image Generator", flush=True)
    print(f"Total images: {total}", flush=True)
    print(f"Output: {OUTPUT_DIR}", flush=True)
    print(f"Verify: {'OFF' if args.skip_verify else 'ON'}", flush=True)
    print(f"Vision QA: {'ON' if args.with_vision else 'OFF'}", flush=True)
    print(f"Mode: {'DRY-RUN' if args.dry_run else 'OVERLAY-ONLY' if args.overlay_only else 'FULL'}", flush=True)
    print(f"{'=' * 60}\n", flush=True)

    stats = {"ok": 0, "skip": 0, "fail": 0, "timeout": 0, "dry": 0}
    report_items = []
    current_scene = None

    for idx, (scene_id, img_idx, bg_prompt, overlay_text) in enumerate(images, 1):
        if scene_id != current_scene:
            current_scene = scene_id
            print(f"\n--- Scene: {scene_id} ---", flush=True)

        print(f"[{idx}/{total}]", flush=True)
        result = process_one_image(
            scene_id, img_idx, bg_prompt, overlay_text,
            dry_run=args.dry_run,
            force=args.force,
            skip_verify=args.skip_verify,
            overlay_only=args.overlay_only,
            skip_vision=skip_vision,
        )
        stats[result] = stats.get(result, 0) + 1

        report_items.append({
            "scene_id": scene_id,
            "index": img_idx,
            "overlay_text": overlay_text,
            "result": result,
        })

        if result == "ok":
            time.sleep(2)

    print(f"\n{'=' * 60}", flush=True)
    print(f"COMPLETE", flush=True)
    print(f"  OK: {stats['ok']}, Skip: {stats['skip']}, Fail: {stats['fail']}", flush=True)
    if args.dry_run:
        print(f"  Dry-run: {stats['dry']}", flush=True)
    print(f"{'=' * 60}", flush=True)

    if args.report:
        report = {
            "total": total,
            "stats": stats,
            "items": report_items,
        }
        with open(args.report, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        print(f"Report saved to: {args.report}", flush=True)


if __name__ == "__main__":
    main()
