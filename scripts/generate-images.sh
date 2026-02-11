#!/bin/bash
# fal.ai Flux Pro で9:16画像を一括生成するスクリプト
# 20シーン × 3枚 = 60枚

FAL_KEY="fc376a81-a3e6-4e6d-aa14-5ed2b14e40fd:4d5a982f1a579818e1dc87822964da4a"
OUTPUT_DIR="/Users/matsumototoshihiko/Desktop/dev/2026kakumei/interactive-vsl-v2/vsl-player/public/images/scenes"
MANGA_STYLE="dramatic Japanese manga illustration style, bold black ink outlines, cel-shading, screentone halftone textures, dynamic speed lines, high contrast shadows, vibrant saturated colors, emotional intensity, professional manga art quality"

mkdir -p "$OUTPUT_DIR"

generate_image() {
  local scene_id="$1"
  local suffix="$2"
  local prompt="$3"
  local output_file="$OUTPUT_DIR/${scene_id}_${suffix}.png"

  if [ -f "$output_file" ]; then
    echo "SKIP: $output_file already exists"
    return 0
  fi

  echo "GENERATING: ${scene_id}_${suffix}..."

  # Submit to queue
  local response
  local json_payload
  json_payload=$(python3 -c "
import json, sys
prompt = sys.stdin.read().strip()
print(json.dumps({'prompt': prompt, 'image_size': {'width': 1080, 'height': 1920}, 'num_images': 1}))
" <<< "$prompt")
  response=$(curl -s -X POST "https://queue.fal.run/fal-ai/flux-pro/v1.1" \
    -H "Authorization: Key $FAL_KEY" \
    -H "Content-Type: application/json" \
    -d "$json_payload")

  local request_id
  request_id=$(echo "$response" | python3 -c "import json,sys; print(json.load(sys.stdin).get('request_id',''))" 2>/dev/null)

  if [ -z "$request_id" ]; then
    echo "ERROR: Failed to submit ${scene_id}_${suffix}: $response"
    return 1
  fi

  # Poll for completion
  local status="IN_QUEUE"
  local attempts=0
  while [ "$status" != "COMPLETED" ] && [ "$attempts" -lt 60 ]; do
    sleep 3
    status=$(curl -s "https://queue.fal.run/fal-ai/flux-pro/requests/$request_id/status" \
      -H "Authorization: Key $FAL_KEY" | python3 -c "import json,sys; print(json.load(sys.stdin).get('status','UNKNOWN'))" 2>/dev/null)
    attempts=$((attempts + 1))
  done

  if [ "$status" != "COMPLETED" ]; then
    echo "TIMEOUT: ${scene_id}_${suffix} (status: $status)"
    return 1
  fi

  # Get result and download
  local result
  result=$(curl -s "https://queue.fal.run/fal-ai/flux-pro/requests/$request_id" \
    -H "Authorization: Key $FAL_KEY")

  local image_url
  image_url=$(echo "$result" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['images'][0]['url'])" 2>/dev/null)

  if [ -z "$image_url" ]; then
    echo "ERROR: No image URL for ${scene_id}_${suffix}"
    return 1
  fi

  # Download and resize to exact 1080x1920
  local tmp_file="/tmp/fal_${scene_id}_${suffix}.jpg"
  curl -s -o "$tmp_file" "$image_url"
  sips -z 1920 1080 "$tmp_file" --out "$output_file" > /dev/null 2>&1

  if [ -f "$output_file" ]; then
    echo "OK: $output_file"
    rm -f "$tmp_file"
    return 0
  else
    echo "ERROR: Failed to save ${scene_id}_${suffix}"
    return 1
  fi
}

# === シーン定義 ===
# 各シーンに3つのプロンプトバリエーション

declare -A SCENES

# s01-hook
SCENES["s01-hook_01"]="Breaking news headline exploding from cracked screen, digital shockwave spreading across futuristic cityscape, holographic AI brain surpassing human silhouette, golden particles and data streams erupting, dramatic impact moment, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s01-hook_02"]="Close-up view of cracked screen with AI emergence, holographic brain breaking through glass, golden data particles, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s01-hook_03"]="Wide angle futuristic cityscape with digital shockwave ripples spreading, holographic AI displays across buildings, ${MANGA_STYLE}, 9:16 vertical format"

# s02-son
SCENES["s02-son_01"]="Powerful businessman silhouette at grand keynote stage, massive holographic displays showing 10000x multiplier and 1000 AI agents floating around, dramatic blue and gold spotlights, conference hall, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s02-son_02"]="Close-up of holographic 10000x display with amazed face in audience, blue and gold light effects, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s02-son_03"]="Panoramic view of conference hall with AI agents everywhere, keynote speaker silhouette, dramatic spotlights, ${MANGA_STYLE}, 9:16 vertical format"

# s03-two-types
SCENES["s03-two-types_01"]="Two diverging dramatic paths at crossroads, left path crumbling into darkness with chains, right path ascending into brilliant golden AI future with wings and light, human silhouette at center, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s03-two-types_02"]="Focus on dark crumbling path with chains breaking, ominous red atmosphere, person turning away, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s03-two-types_03"]="Focus on ascending golden path with wings of light, hopeful atmosphere, person reaching upward, ${MANGA_STYLE}, 9:16 vertical format"

# cp1
SCENES["cp1_01"]="Three glowing manga-style doors in dramatic corridor, left door blazing red with shield emblem, center door shining gold with trophy emblem, right door electric blue with gear emblem, energy radiating, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["cp1_02"]="Close-up of three doors with energy emanating outward, intense choice moment, vibrant colors, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["cp1_03"]="Person standing before three glowing doors, dramatic perspective from behind, energy radiating from each door, ${MANGA_STYLE}, 9:16 vertical format"

# s04a-practice
SCENES["s04a-practice_01"]="Intense manga protagonist working surrounded by holographic screens and data streams, glowing investment counter showing 10 million yen, determination and sweat drops, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s04a-practice_02"]="Close-up of determined face with holographic screens reflected in eyes, intense focus, data streams, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s04a-practice_03"]="Wide shot showing massive workspace with floating data, holographic screens everywhere, lone determined worker, ${MANGA_STYLE}, 9:16 vertical format"

# s05a-ceo
SCENES["s05a-ceo_01"]="Powerful corporate executives in dramatic manga reaction shots, speech bubbles showing amazement, CEO pointing with sparkle eyes, golden approval stamp, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s05a-ceo_02"]="Close-up of CEO with sparkle eyes and approval gesture, golden aura, amazed expression, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s05a-ceo_03"]="Multiple reaction panels layout showing shocked executives, speech bubbles with exclamation marks, ${MANGA_STYLE}, 9:16 vertical format"

# s06a-beginner
SCENES["s06a-beginner_01"]="Manga-style transformation sequence, ordinary person transforming into confident professional, floating achievement numbers 4 million yen, cost comparison dramatic, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s06a-beginner_02"]="Close-up of transformation moment with achievement numbers floating, golden sparkles, confidence emerging, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s06a-beginner_03"]="Side by side before and after comparison panels, ordinary on left becoming professional on right, dramatic transition effect, ${MANGA_STYLE}, 9:16 vertical format"

# s07a-top
SCENES["s07a-top_01"]="Elite group of successful manga characters standing confidently, speech bubbles with testimonials, income indicators 50M to 1B yen, golden aura, triumphant pose, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s07a-top_02"]="Close-up of confident leader with golden aura and floating income numbers, determination and success, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s07a-top_03"]="Wide shot of group celebration with AI hologram towering above them, victory atmosphere, golden particles, ${MANGA_STYLE}, 9:16 vertical format"

# s08a-join
SCENES["s08a-join_01"]="Grand manga invitation scene, golden ticket or VIP pass floating toward viewer, seminar hall with 30 premium seats glowing, warm golden light, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s08a-join_02"]="Close-up of golden VIP ticket with sparkle effects, premium quality, inviting atmosphere, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s08a-join_03"]="Wide shot of premium seminar hall with 30 glowing seats, golden warm atmosphere, Zoom interface hologram, ${MANGA_STYLE}, 9:16 vertical format"

# s04b-gap
SCENES["s04b-gap_01"]="Dramatic exponential gap visualization, small figure being left behind as massive gap widens, giant 10000x number looming, clock ticking, dark ominous red warning, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s04b-gap_02"]="Close-up of 10000x gap number with desperate figure below, chains and barriers, ominous red glow, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s04b-gap_03"]="Dramatic wide view of exponential curve separating two groups of people, one ascending one falling, ${MANGA_STYLE}, 9:16 vertical format"

# s05b-bubble
SCENES["s05b-bubble_01"]="Historical timeline showing IT bubble, crypto bubble, SNS bubble as smaller waves, then massive AI tsunami wave towering above all, surfers on golden wave top, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s05b-bubble_02"]="Close-up of surfers riding golden AI wave crest triumphantly, massive wave energy, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s05b-bubble_03"]="Panoramic view of historical bubble waves compared to massive AI wave, timeline progression, dramatic scale contrast, ${MANGA_STYLE}, 9:16 vertical format"

# s06b-revolution
SCENES["s06b-revolution_01"]="Split manga panel showing jobs replaced by AI robots on one side and people leveraging AI to multiply output on other, dramatic contrast, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s06b-revolution_02"]="Close-up of person leveraging AI with multiplied output icons surrounding them, empowered expression, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s06b-revolution_03"]="Dramatic split panel showing replacement versus empowerment, dark side and bright side contrast, ${MANGA_STYLE}, 9:16 vertical format"

# s07b-05percent
SCENES["s07b-05percent_01"]="Dramatic manga runway scene, airplane accelerating before takeoff, 0.5 percent illuminated figure at departure gate, 99.5 percent walking away, countdown, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s07b-05percent_02"]="Close-up of illuminated figure at departure gate with countdown clock, determination, last chance atmosphere, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s07b-05percent_03"]="Dramatic runway perspective with airplane accelerating toward sky, speed lines, epic departure moment, ${MANGA_STYLE}, 9:16 vertical format"

# s08b-stillintime
SCENES["s08b-stillintime_01"]="Hope breaking through darkness, crack of golden light splitting dark sky, person stepping through portal into bright seminar hall, transformation, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s08b-stillintime_02"]="Close-up of person stepping through golden portal from darkness to light, determination, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s08b-stillintime_03"]="Wide view of dark sky cracking open with golden breakthrough light, hope and renewal, green and gold energy, ${MANGA_STYLE}, 9:16 vertical format"

# s04c-pocket
SCENES["s04c-pocket_01"]="Magical fourth-dimensional pocket opening, holographic interface emerging with multiple capability icons orbiting, person speaking into microphone ideas materializing, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s04c-pocket_02"]="Close-up of magical pocket opening with holographic icons emerging outward, wonder and amazement, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s04c-pocket_03"]="Wide view of ideas materializing as 3D objects around amazed person, magical atmosphere, capability meter, ${MANGA_STYLE}, 9:16 vertical format"

# s05c-evolution
SCENES["s05c-evolution_01"]="Infinite evolution spiral ascending through manga panels, system growing from seed to massive tree of capabilities, person freed from chains, liberation, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s05c-evolution_02"]="Close-up of evolution spiral with growing capability tree, golden branches spreading, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s05c-evolution_03"]="Person breaking free from chains of marketing tasks while AI system handles everything, liberation visual, ${MANGA_STYLE}, 9:16 vertical format"

# s06c-seminar
SCENES["s06c-seminar_01"]="Grand manga showcase of system capabilities, circular arrangement of feature icons each in own panel, AI marketing, video generation, connected to central AI brain, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s06c-seminar_02"]="Close-up of central AI brain with connected feature icons radiating outward, neural network visual, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s06c-seminar_03"]="Wide exhibition hall view with all capability panels displayed, impressive showcase atmosphere, ${MANGA_STYLE}, 9:16 vertical format"

# s07c-bonus
SCENES["s07c-bonus_01"]="Treasure chest opening revealing golden Gemini Gem icons, VIP golden ticket floating, gift boxes with sparkle effects, premium bonus package, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s07c-bonus_02"]="Close-up of golden Gem icons emerging from treasure chest, sparkle and glow effects, premium quality, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s07c-bonus_03"]="VIP golden ticket floating with exclusive stamp and sparkle effects, premium invitation atmosphere, ${MANGA_STYLE}, 9:16 vertical format"

# s08c-goevolve
SCENES["s08c-goevolve_01"]="Dynamic manga character reaching upward to grab golden opportunity orb, Zoom seminar in background, 30 seats countdown, determined expression, rising energy, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s08c-goevolve_02"]="Close-up of clenched fist reaching for golden orb, determination and power, energy radiating, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s08c-goevolve_03"]="Wide shot of determined character with rising energy wave behind them, empowerment atmosphere, ${MANGA_STYLE}, 9:16 vertical format"

# s10-final-cta
SCENES["s10-final-cta_01"]="Epic final manga scene, two diverging paths of humanity splitting cosmic space, massive LINE icon glowing green at center, countdown 30 seats, golden and green particles, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s10-final-cta_02"]="Close-up of LINE icon with green energy radiating outward, inviting warm glow, invitation atmosphere, ${MANGA_STYLE}, 9:16 vertical format"
SCENES["s10-final-cta_03"]="Cosmic wide view of two diverging paths with hand reaching toward viewer, emotional climax, golden and green swirling, ${MANGA_STYLE}, 9:16 vertical format"

# === 実行 ===
TOTAL=${#SCENES[@]}
COUNT=0
SUCCESS=0
FAIL=0

echo "=== fal.ai Flux Pro 画像生成開始 ==="
echo "Total: $TOTAL images"
echo ""

for key in $(echo "${!SCENES[@]}" | tr ' ' '\n' | sort); do
  COUNT=$((COUNT + 1))
  scene_id="${key%_*}"
  suffix="${key##*_}"

  echo "[$COUNT/$TOTAL] $key"
  if generate_image "$scene_id" "$suffix" "${SCENES[$key]}"; then
    SUCCESS=$((SUCCESS + 1))
  else
    FAIL=$((FAIL + 1))
  fi
  echo ""
done

echo "=== 完了 ==="
echo "成功: $SUCCESS / $TOTAL"
echo "失敗: $FAIL / $TOTAL"
