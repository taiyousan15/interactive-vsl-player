#!/usr/bin/env python3
"""fal.ai Flux Pro - imageCount > 3 のシーン用追加画像生成 (11枚)"""

import json
import os
import subprocess
import sys
import time
import urllib.request

FAL_KEY = os.environ.get("FAL_KEY", "fc376a81-a3e6-4e6d-aa14-5ed2b14e40fd:4d5a982f1a579818e1dc87822964da4a")
OUTPUT_DIR = "/Users/matsumototoshihiko/Desktop/dev/2026kakumei/interactive-vsl-v2/vsl-player/public/images/scenes"
MANGA_STYLE = "dramatic Japanese manga illustration style, bold black ink outlines, cel-shading, screentone halftone textures, dynamic speed lines, high contrast shadows, vibrant saturated colors, emotional intensity, professional manga art quality"

# Only scenes that need _04 or _05 (imageCount > 3)
EXTRA_IMAGES = [
    # s01-hook: needs 5 images → _04, _05
    ("s01-hook", "04", f"Dramatic manga close-up of smartphone screen showing AI revolution headline, notification explosion with urgency icons, person's shocked wide-open eyes reflected in phone glass, red and gold dramatic lighting, {MANGA_STYLE}, 9:16 vertical format"),
    ("s01-hook", "05", f"Sweeping manga establishing shot of Tokyo futuristic skyline with massive AI hologram projections between skyscrapers, digital aurora borealis in sky, tiny human figures looking up in awe at the spectacle, epic scale composition, {MANGA_STYLE}, 9:16 vertical format"),

    # s02-son: needs 4 images → _04
    ("s02-son", "04", f"Dramatic manga panel of 1000 AI agents floating as holographic avatars in massive formation, each performing different tasks simultaneously, central command figure orchestrating from below, epic army-scale visualization, {MANGA_STYLE}, 9:16 vertical format"),

    # s04a-practice: needs 4 images → _04
    ("s04a-practice", "04", f"Manga progress montage showing investment growing from coins to massive gold pile, calendar pages flying past with checkmarks, effort and time visualization, {MANGA_STYLE}, 9:16 vertical format"),

    # s06a-beginner: needs 4 images → _04
    ("s06a-beginner", "04", f"Split comparison panel in manga style, left panel showing expensive old method with price tag 500000 yen crossed out, right panel showing new AI method at 1000 yen with sparkle effects, dramatic cost revolution visual, {MANGA_STYLE}, 9:16 vertical format"),

    # s04b-gap: needs 4 images → _04
    ("s04b-gap", "04", f"Dramatic manga hourglass with sand running out rapidly, inside hourglass showing two timelines diverging, person desperately reaching upward as gap widens, red urgency atmosphere with warning symbols, {MANGA_STYLE}, 9:16 vertical format"),

    # s05b-bubble: needs 4 images → _04
    ("s05b-bubble", "04", f"Dramatic manga comparison of profit scale, tiny IT bubble profits on left, medium crypto profits in middle, massive AI profit mountain on right dwarfing everything, golden glow on the AI mountain, early adopters celebrating at summit, {MANGA_STYLE}, 9:16 vertical format"),

    # s04c-pocket: needs 4 images → _04
    ("s04c-pocket", "04", f"Manga visualization of voice-to-creation magic, sound waves from person's mouth transforming into complete website, app, and marketing materials mid-air, magical transformation sequence with sparkles, {MANGA_STYLE}, 9:16 vertical format"),

    # s06c-seminar: needs 4 images → _04
    ("s06c-seminar", "04", f"Manga-style capability explosion diagram, central system core radiating outward with connected nodes showing Kindle, video, SNS, LP, research capabilities, each node glowing and active, neural network aesthetic, {MANGA_STYLE}, 9:16 vertical format"),

    # s10-final-cta: needs 5 images → _04, _05
    ("s10-final-cta", "04", f"Dramatic manga close-up of glowing LINE app invitation with green particle effects and warm welcoming energy, 30 premium seats countdown timer pulsing with urgency, golden frame border, VIP exclusive atmosphere, {MANGA_STYLE}, 9:16 vertical format"),
    ("s10-final-cta", "05", f"Epic manga panoramic view of transformation journey from dark past through present action to bright golden future, human silhouette taking decisive step forward into light, cosmic energy spiral surrounding them, ultimate climax and resolution, {MANGA_STYLE}, 9:16 vertical format"),
]


def fal_request(method, url, data=None):
    """fal.ai APIへのHTTPリクエスト"""
    headers = {
        "Authorization": f"Key {FAL_KEY}",
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(url, headers=headers, method=method)
    if data:
        req.data = json.dumps(data).encode()
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def generate_image(scene_id, suffix, prompt):
    """1枚の画像を生成してダウンロード"""
    output_file = os.path.join(OUTPUT_DIR, f"{scene_id}_{suffix}.png")
    if os.path.exists(output_file):
        print(f"  SKIP: {scene_id}_{suffix} (exists)", flush=True)
        return True

    # Submit
    try:
        resp = fal_request("POST", "https://queue.fal.run/fal-ai/flux-pro/v1.1", {
            "prompt": prompt,
            "image_size": {"width": 1080, "height": 1920},
            "num_images": 1,
        })
    except Exception as e:
        print(f"  ERROR submit {scene_id}_{suffix}: {e}", flush=True)
        return False

    request_id = resp.get("request_id")
    if not request_id:
        print(f"  ERROR: no request_id for {scene_id}_{suffix}", flush=True)
        return False

    # Poll
    for _ in range(60):
        time.sleep(3)
        try:
            status_resp = fal_request("GET",
                f"https://queue.fal.run/fal-ai/flux-pro/requests/{request_id}/status")
            if status_resp.get("status") == "COMPLETED":
                break
        except Exception:
            pass
    else:
        print(f"  TIMEOUT: {scene_id}_{suffix}", flush=True)
        return False

    # Download
    try:
        result = fal_request("GET",
            f"https://queue.fal.run/fal-ai/flux-pro/requests/{request_id}")
        image_url = result["images"][0]["url"]
    except Exception as e:
        print(f"  ERROR result {scene_id}_{suffix}: {e}", flush=True)
        return False

    tmp_file = f"/tmp/fal_{scene_id}_{suffix}.jpg"
    try:
        urllib.request.urlretrieve(image_url, tmp_file)
        # Resize to exact 1080x1920 using sips
        subprocess.run(
            ["sips", "-z", "1920", "1080", tmp_file, "--out", output_file],
            capture_output=True, check=True,
        )
        os.remove(tmp_file)
        size = os.path.getsize(output_file)
        print(f"  OK: {scene_id}_{suffix} ({size:,} bytes)", flush=True)
        return True
    except Exception as e:
        print(f"  ERROR download {scene_id}_{suffix}: {e}", flush=True)
        return False


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    total = len(EXTRA_IMAGES)
    success = 0
    fail = 0

    print(f"=== fal.ai Flux Pro 追加画像生成 ===", flush=True)
    print(f"Total: {total} images (imageCount > 3 のシーン用)\n", flush=True)

    for i, (scene_id, suffix, prompt) in enumerate(EXTRA_IMAGES, 1):
        print(f"[{i}/{total}] {scene_id}_{suffix}", flush=True)
        if generate_image(scene_id, suffix, prompt):
            success += 1
        else:
            fail += 1

    print(f"\n=== 完了 ===", flush=True)
    print(f"成功: {success}/{total}", flush=True)
    if fail > 0:
        print(f"失敗: {fail}/{total}", flush=True)


if __name__ == "__main__":
    main()
