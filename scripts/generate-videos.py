#!/usr/bin/env python3
"""fal.ai MiniMax Hailuo I2V で動画クリップを生成"""

import json
import os
import sys
import time
import urllib.request

FAL_KEY = "fc376a81-a3e6-4e6d-aa14-5ed2b14e40fd:4d5a982f1a579818e1dc87822964da4a"
OUTPUT_DIR = "/Users/matsumototoshihiko/Desktop/dev/2026kakumei/interactive-vsl-v2/vsl-player/public/video/scenes"
IMAGE_BASE_URL = "https://vsl-player.vercel.app/images/scenes"
MODEL = "fal-ai/minimax-video/image-to-video"
# fal.ai queue API: subpath is used for submit only, NOT for status/result
MODEL_BASE = "fal-ai/minimax-video"

MANGA_STYLE = "dramatic Japanese manga illustration style, bold black ink outlines, cel-shading, dynamic speed lines, vibrant saturated colors, emotional intensity"

VIDEO_SCENES = [
    ("s01-hook", f"Breaking news headline explosion, digital shockwave spreading across futuristic cityscape, holographic AI brain surpassing human silhouette, golden particles erupting, camera slowly zooming in, {MANGA_STYLE}"),
    ("s02-son", f"Powerful businessman at keynote stage, holographic displays showing multiplier numbers, AI agents floating around, dramatic blue and gold spotlights, slow pan across conference hall, {MANGA_STYLE}"),
    ("s04a-practice", f"Intense protagonist working surrounded by holographic screens and data streams, glowing counter, determination and focus, camera slowly rotating around subject, {MANGA_STYLE}"),
    ("s06a-beginner", f"Transformation sequence, ordinary person becoming confident professional, floating achievement numbers, dramatic before-after transition, energy wave expanding outward, {MANGA_STYLE}"),
    ("s07a-top", f"Elite group standing confidently with golden aura, speech bubbles appearing, income numbers floating upward, triumphant pose, slow zoom out revealing AI hologram, {MANGA_STYLE}"),
    ("s04b-gap", f"Exponential gap widening dramatically, small figure being left behind, giant numbers looming overhead, clock ticking, dark ominous atmosphere intensifying, {MANGA_STYLE}"),
    ("s06b-revolution", f"Split panel animation, jobs being replaced on one side while people leverage AI on the other, dramatic contrast, business icons transforming, {MANGA_STYLE}"),
    ("s07b-05percent", f"Dramatic runway scene, airplane accelerating before takeoff, illuminated figure at departure gate, countdown clock ticking, intense speed lines, {MANGA_STYLE}"),
    ("s04c-pocket", f"Magical pocket opening, holographic interface emerging with capability icons orbiting, ideas materializing as 3D objects, wonder and amazement, {MANGA_STYLE}"),
    ("s05c-evolution", f"Evolution spiral ascending, system growing from seed to massive tree of capabilities, person being freed from chains, liberation visual, {MANGA_STYLE}"),
    ("s08c-goevolve", f"Dynamic character reaching upward to grab golden opportunity orb, energy wave rising behind them, determined expression, empowerment atmosphere, {MANGA_STYLE}"),
    ("s10-final-cta", f"Two diverging paths splitting cosmic space, massive LINE icon glowing green at center, golden and green particles swirling, emotional climax, hand reaching toward viewer, {MANGA_STYLE}"),
]


def fal_request(method, url, data=None):
    headers = {
        "Authorization": f"Key {FAL_KEY}",
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(url, headers=headers, method=method)
    if data:
        req.data = json.dumps(data).encode()
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def generate_video(scene_id, prompt):
    output_file = os.path.join(OUTPUT_DIR, f"{scene_id}.mp4")
    if os.path.exists(output_file):
        print(f"  SKIP: {scene_id} (exists)", flush=True)
        return True

    image_url = f"{IMAGE_BASE_URL}/{scene_id}_01.png"

    try:
        resp = fal_request("POST", f"https://queue.fal.run/{MODEL}", {
            "prompt": prompt,
            "image_url": image_url,
        })
    except Exception as e:
        print(f"  ERROR submit {scene_id}: {e}", flush=True)
        return False

    request_id = resp.get("request_id")
    if not request_id:
        print(f"  ERROR: no request_id for {scene_id}: {resp}", flush=True)
        return False

    print(f"  Submitted: {request_id}", flush=True)

    # Poll (up to 10 minutes for video generation)
    for attempt in range(200):
        time.sleep(3)
        try:
            status_resp = fal_request("GET",
                f"https://queue.fal.run/{MODEL_BASE}/requests/{request_id}/status")
            status = status_resp.get("status", "UNKNOWN")
            if status == "COMPLETED":
                break
            if status == "FAILED":
                print(f"  FAILED: {scene_id}", flush=True)
                return False
            if attempt % 10 == 0:
                print(f"  Polling {scene_id}: {status} ({attempt * 3}s)", flush=True)
        except Exception:
            pass
    else:
        print(f"  TIMEOUT: {scene_id}", flush=True)
        return False

    # Download
    try:
        result = fal_request("GET",
            f"https://queue.fal.run/{MODEL_BASE}/requests/{request_id}")
        video_url = result["video"]["url"]
    except Exception as e:
        print(f"  ERROR result {scene_id}: {e}", flush=True)
        return False

    try:
        urllib.request.urlretrieve(video_url, output_file)
        file_size = os.path.getsize(output_file)
        print(f"  OK: {scene_id} ({file_size} bytes)", flush=True)
        return True
    except Exception as e:
        print(f"  ERROR download {scene_id}: {e}", flush=True)
        return False


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    batch = None
    if len(sys.argv) > 2 and sys.argv[1] == "--batch":
        batch = int(sys.argv[2])

    scenes = VIDEO_SCENES
    if batch is not None:
        half = len(VIDEO_SCENES) // 2
        if batch == 1:
            scenes = VIDEO_SCENES[:half]
        elif batch == 2:
            scenes = VIDEO_SCENES[half:]

    total = len(scenes)
    success = 0
    fail = 0

    label = f" (batch {batch})" if batch else ""
    print(f"=== fal.ai MiniMax I2V 動画生成{label} ===", flush=True)
    print(f"Total: {total} videos\n", flush=True)

    for i, (scene_id, prompt) in enumerate(scenes, 1):
        print(f"[{i}/{total}] {scene_id}", flush=True)
        if generate_video(scene_id, prompt):
            success += 1
        else:
            fail += 1

    print(f"\n=== 完了{label} ===", flush=True)
    print(f"成功: {success}/{total}", flush=True)
    print(f"失敗: {fail}/{total}", flush=True)


if __name__ == "__main__":
    main()
