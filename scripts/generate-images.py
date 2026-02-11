#!/usr/bin/env python3
"""fal.ai Flux Pro で9:16漫画風画像を一括生成"""

import json
import os
import subprocess
import sys
import time
import urllib.request

FAL_KEY = "fc376a81-a3e6-4e6d-aa14-5ed2b14e40fd:4d5a982f1a579818e1dc87822964da4a"
OUTPUT_DIR = "/Users/matsumototoshihiko/Desktop/dev/2026kakumei/interactive-vsl-v2/vsl-player/public/images/scenes"
MANGA_STYLE = "dramatic Japanese manga illustration style, bold black ink outlines, cel-shading, screentone halftone textures, dynamic speed lines, high contrast shadows, vibrant saturated colors, emotional intensity, professional manga art quality"

SCENES = [
    # s01-hook
    ("s01-hook", "01", f"Breaking news headline exploding from cracked screen, digital shockwave spreading across futuristic cityscape, holographic AI brain surpassing human silhouette, golden particles and data streams erupting, dramatic impact moment, {MANGA_STYLE}, 9:16 vertical format"),
    ("s01-hook", "02", f"Close-up view of cracked screen with AI emergence, holographic brain breaking through glass, golden data particles erupting, {MANGA_STYLE}, 9:16 vertical format"),
    ("s01-hook", "03", f"Wide angle futuristic cityscape with digital shockwave ripples spreading, holographic AI displays across buildings, neon glow, {MANGA_STYLE}, 9:16 vertical format"),

    # s02-son
    ("s02-son", "01", f"Powerful businessman silhouette at grand keynote stage, massive holographic displays showing 10000x multiplier and 1000 AI agents floating around, dramatic blue and gold spotlights, conference hall, {MANGA_STYLE}, 9:16 vertical format"),
    ("s02-son", "02", f"Close-up of holographic 10000x display with amazed face in audience, blue and gold light effects, keynote atmosphere, {MANGA_STYLE}, 9:16 vertical format"),
    ("s02-son", "03", f"Panoramic view of conference hall with AI agents everywhere, keynote speaker silhouette, dramatic spotlights, {MANGA_STYLE}, 9:16 vertical format"),

    # s03-two-types
    ("s03-two-types", "01", f"Two diverging dramatic paths at crossroads, left path crumbling into darkness with chains, right path ascending into brilliant golden AI future with wings and light, human silhouette at center, {MANGA_STYLE}, 9:16 vertical format"),
    ("s03-two-types", "02", f"Focus on dark crumbling path with chains breaking, ominous red atmosphere, person turning away from progress, {MANGA_STYLE}, 9:16 vertical format"),
    ("s03-two-types", "03", f"Focus on ascending golden path with wings of light, hopeful atmosphere, person reaching upward to bright future, {MANGA_STYLE}, 9:16 vertical format"),

    # cp1
    ("cp1", "01", f"Three glowing manga-style doors in dramatic corridor, left door blazing red with shield emblem, center door shining gold with trophy emblem, right door electric blue with gear emblem, energy radiating, {MANGA_STYLE}, 9:16 vertical format"),
    ("cp1", "02", f"Close-up of three doors with energy emanating outward, intense choice moment, vibrant colors glowing, {MANGA_STYLE}, 9:16 vertical format"),
    ("cp1", "03", f"Person standing before three glowing doors, dramatic perspective from behind, energy radiating from each door, {MANGA_STYLE}, 9:16 vertical format"),

    # s04a-practice
    ("s04a-practice", "01", f"Intense manga protagonist working surrounded by holographic screens and data streams, glowing investment counter showing 10 million yen, determination and sweat drops, {MANGA_STYLE}, 9:16 vertical format"),
    ("s04a-practice", "02", f"Close-up of determined face with holographic screens reflected in eyes, intense focus, data streams flowing, {MANGA_STYLE}, 9:16 vertical format"),
    ("s04a-practice", "03", f"Wide shot showing massive workspace with floating data, holographic screens everywhere, lone determined worker at center, {MANGA_STYLE}, 9:16 vertical format"),

    # s05a-ceo
    ("s05a-ceo", "01", f"Powerful corporate executives in dramatic manga reaction shots, speech bubbles showing amazement, CEO pointing with sparkle eyes, golden approval stamp, {MANGA_STYLE}, 9:16 vertical format"),
    ("s05a-ceo", "02", f"Close-up of CEO with sparkle eyes and approval gesture, golden aura, amazed expression, business suit, {MANGA_STYLE}, 9:16 vertical format"),
    ("s05a-ceo", "03", f"Multiple reaction panels layout showing shocked executives, speech bubbles with exclamation marks, manga panel grid, {MANGA_STYLE}, 9:16 vertical format"),

    # s06a-beginner
    ("s06a-beginner", "01", f"Manga-style transformation sequence, ordinary person transforming into confident professional, floating achievement numbers 4 million yen, cost comparison dramatic, {MANGA_STYLE}, 9:16 vertical format"),
    ("s06a-beginner", "02", f"Close-up of transformation moment with achievement numbers floating, golden sparkles, confidence emerging from ordinary person, {MANGA_STYLE}, 9:16 vertical format"),
    ("s06a-beginner", "03", f"Side by side before and after comparison panels, ordinary person on left becoming professional on right, dramatic transition effect, {MANGA_STYLE}, 9:16 vertical format"),

    # s07a-top
    ("s07a-top", "01", f"Elite group of successful manga characters standing confidently, speech bubbles with testimonials, income indicators 50M to 1B yen, golden aura, triumphant pose, {MANGA_STYLE}, 9:16 vertical format"),
    ("s07a-top", "02", f"Close-up of confident leader with golden aura and floating income numbers, determination and success expression, {MANGA_STYLE}, 9:16 vertical format"),
    ("s07a-top", "03", f"Wide shot of group celebration with AI hologram towering above them, victory atmosphere, golden particles swirling, {MANGA_STYLE}, 9:16 vertical format"),

    # s08a-join
    ("s08a-join", "01", f"Grand manga invitation scene, golden ticket or VIP pass floating toward viewer, seminar hall with 30 premium seats glowing, warm golden light, {MANGA_STYLE}, 9:16 vertical format"),
    ("s08a-join", "02", f"Close-up of golden VIP ticket with sparkle effects, premium quality invitation, warm atmosphere, {MANGA_STYLE}, 9:16 vertical format"),
    ("s08a-join", "03", f"Wide shot of premium seminar hall with 30 glowing seats, golden warm atmosphere, Zoom interface hologram floating, {MANGA_STYLE}, 9:16 vertical format"),

    # s04b-gap
    ("s04b-gap", "01", f"Dramatic exponential gap visualization, small figure being left behind as massive gap widens, giant 10000x number looming, clock ticking, dark ominous red warning, {MANGA_STYLE}, 9:16 vertical format"),
    ("s04b-gap", "02", f"Close-up of 10000x gap number with desperate figure below, chains and barriers, ominous red glow surrounding, {MANGA_STYLE}, 9:16 vertical format"),
    ("s04b-gap", "03", f"Dramatic wide view of exponential curve separating two groups of people, one ascending one falling behind, {MANGA_STYLE}, 9:16 vertical format"),

    # s05b-bubble
    ("s05b-bubble", "01", f"Historical timeline showing IT bubble, crypto bubble, SNS bubble as smaller waves, then massive AI tsunami wave towering above all, surfers on golden wave top, {MANGA_STYLE}, 9:16 vertical format"),
    ("s05b-bubble", "02", f"Close-up of surfers riding golden AI wave crest triumphantly, massive wave energy below, {MANGA_STYLE}, 9:16 vertical format"),
    ("s05b-bubble", "03", f"Panoramic view of historical bubble waves compared to massive AI wave, timeline progression left to right, dramatic scale, {MANGA_STYLE}, 9:16 vertical format"),

    # s06b-revolution
    ("s06b-revolution", "01", f"Split manga panel showing jobs replaced by AI robots on one side and people leveraging AI to multiply output on other, dramatic contrast, {MANGA_STYLE}, 9:16 vertical format"),
    ("s06b-revolution", "02", f"Close-up of person leveraging AI with multiplied output icons surrounding them, empowered expression, {MANGA_STYLE}, 9:16 vertical format"),
    ("s06b-revolution", "03", f"Dramatic split panel showing replacement versus empowerment, dark red side and bright gold side contrast, {MANGA_STYLE}, 9:16 vertical format"),

    # s07b-05percent
    ("s07b-05percent", "01", f"Dramatic manga runway scene, airplane accelerating before takeoff, illuminated figure at departure gate while crowd walks away, countdown clock, {MANGA_STYLE}, 9:16 vertical format"),
    ("s07b-05percent", "02", f"Close-up of illuminated figure at departure gate with countdown clock, determination expression, last chance atmosphere, {MANGA_STYLE}, 9:16 vertical format"),
    ("s07b-05percent", "03", f"Dramatic runway perspective with airplane accelerating toward sky, speed lines radiating, epic departure moment, {MANGA_STYLE}, 9:16 vertical format"),

    # s08b-stillintime
    ("s08b-stillintime", "01", f"Hope breaking through darkness, crack of golden light splitting dark sky, person stepping through portal into bright seminar hall, transformation moment, {MANGA_STYLE}, 9:16 vertical format"),
    ("s08b-stillintime", "02", f"Close-up of person stepping through golden portal from darkness to light, determination expression, {MANGA_STYLE}, 9:16 vertical format"),
    ("s08b-stillintime", "03", f"Wide view of dark sky cracking open with golden breakthrough light, hope and renewal, green and gold energy swirling, {MANGA_STYLE}, 9:16 vertical format"),

    # s04c-pocket
    ("s04c-pocket", "01", f"Magical fourth-dimensional pocket opening, holographic interface emerging with multiple capability icons orbiting, person speaking into microphone ideas materializing, {MANGA_STYLE}, 9:16 vertical format"),
    ("s04c-pocket", "02", f"Close-up of magical pocket opening with holographic icons emerging outward, wonder and amazement atmosphere, {MANGA_STYLE}, 9:16 vertical format"),
    ("s04c-pocket", "03", f"Wide view of ideas materializing as 3D objects around amazed person, magical atmosphere, capability meter display, {MANGA_STYLE}, 9:16 vertical format"),

    # s05c-evolution
    ("s05c-evolution", "01", f"Infinite evolution spiral ascending through manga panels, system growing from seed to massive tree of capabilities, person freed from chains, liberation visual, {MANGA_STYLE}, 9:16 vertical format"),
    ("s05c-evolution", "02", f"Close-up of evolution spiral with growing capability tree, golden branches spreading outward, {MANGA_STYLE}, 9:16 vertical format"),
    ("s05c-evolution", "03", f"Person breaking free from chains of marketing tasks while AI system handles everything, liberation and freedom, {MANGA_STYLE}, 9:16 vertical format"),

    # s06c-seminar
    ("s06c-seminar", "01", f"Grand manga showcase of system capabilities, circular arrangement of feature icons, AI marketing, video generation, connected to central AI brain, exhibition hall, {MANGA_STYLE}, 9:16 vertical format"),
    ("s06c-seminar", "02", f"Close-up of central AI brain with connected feature icons radiating outward, neural network visual, glowing connections, {MANGA_STYLE}, 9:16 vertical format"),
    ("s06c-seminar", "03", f"Wide exhibition hall view with all capability panels displayed, impressive showcase atmosphere, futuristic design, {MANGA_STYLE}, 9:16 vertical format"),

    # s07c-bonus
    ("s07c-bonus", "01", f"Treasure chest opening revealing golden gem icons, VIP golden ticket floating, gift boxes with sparkle effects, premium bonus package visualization, {MANGA_STYLE}, 9:16 vertical format"),
    ("s07c-bonus", "02", f"Close-up of golden gem icons emerging from treasure chest, sparkle and glow effects, premium quality, {MANGA_STYLE}, 9:16 vertical format"),
    ("s07c-bonus", "03", f"VIP golden ticket floating with exclusive stamp and sparkle effects, premium invitation atmosphere, {MANGA_STYLE}, 9:16 vertical format"),

    # s08c-goevolve
    ("s08c-goevolve", "01", f"Dynamic manga character reaching upward to grab golden opportunity orb, Zoom seminar in background, 30 seats countdown, determined expression, {MANGA_STYLE}, 9:16 vertical format"),
    ("s08c-goevolve", "02", f"Close-up of clenched fist reaching for golden orb, determination and power radiating, energy emanating, {MANGA_STYLE}, 9:16 vertical format"),
    ("s08c-goevolve", "03", f"Wide shot of determined character with rising energy wave behind them, empowerment atmosphere, golden glow, {MANGA_STYLE}, 9:16 vertical format"),

    # s10-final-cta
    ("s10-final-cta", "01", f"Epic final manga scene, two diverging paths of humanity splitting cosmic space, massive LINE icon glowing green at center, countdown 30 seats, golden green particles, {MANGA_STYLE}, 9:16 vertical format"),
    ("s10-final-cta", "02", f"Close-up of LINE icon with green energy radiating outward, inviting warm glow, invitation atmosphere, {MANGA_STYLE}, 9:16 vertical format"),
    ("s10-final-cta", "03", f"Cosmic wide view of two diverging paths with hand reaching toward viewer, emotional climax, golden and green swirling energy, {MANGA_STYLE}, 9:16 vertical format"),
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
        print(f"  SKIP: {scene_id}_{suffix} (exists)")
        return True

    # Submit
    try:
        resp = fal_request("POST", "https://queue.fal.run/fal-ai/flux-pro/v1.1", {
            "prompt": prompt,
            "image_size": {"width": 1080, "height": 1920},
            "num_images": 1,
        })
    except Exception as e:
        print(f"  ERROR submit {scene_id}_{suffix}: {e}")
        return False

    request_id = resp.get("request_id")
    if not request_id:
        print(f"  ERROR: no request_id for {scene_id}_{suffix}")
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
        print(f"  TIMEOUT: {scene_id}_{suffix}")
        return False

    # Download
    try:
        result = fal_request("GET",
            f"https://queue.fal.run/fal-ai/flux-pro/requests/{request_id}")
        image_url = result["images"][0]["url"]
    except Exception as e:
        print(f"  ERROR result {scene_id}_{suffix}: {e}")
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
        print(f"  OK: {scene_id}_{suffix}")
        return True
    except Exception as e:
        print(f"  ERROR download {scene_id}_{suffix}: {e}")
        return False


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Support --batch N argument for parallel execution
    batch = None
    if len(sys.argv) > 2 and sys.argv[1] == "--batch":
        batch = int(sys.argv[2])

    scenes = SCENES
    if batch is not None:
        chunk_size = len(SCENES) // 3
        if batch == 1:
            scenes = SCENES[:chunk_size]
        elif batch == 2:
            scenes = SCENES[chunk_size:chunk_size * 2]
        elif batch == 3:
            scenes = SCENES[chunk_size * 2:]

    total = len(scenes)
    success = 0
    fail = 0

    label = f" (batch {batch})" if batch else ""
    print(f"=== fal.ai Flux Pro 画像生成{label} ===")
    print(f"Total: {total} images\n")

    for i, (scene_id, suffix, prompt) in enumerate(scenes, 1):
        print(f"[{i}/{total}] {scene_id}_{suffix}")
        if generate_image(scene_id, suffix, prompt):
            success += 1
        else:
            fail += 1

    print(f"\n=== 完了{label} ===")
    print(f"成功: {success}/{total}")
    print(f"失敗: {fail}/{total}")


if __name__ == "__main__":
    main()
