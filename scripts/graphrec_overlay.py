#!/usr/bin/env python3
"""グラレコ風テキストオーバーレイエンジン

NanoBanana Pro で生成したテキストなし背景画像に、
Pillow で正確な日本語テキストをグラレコ風にオーバーレイする。

フォント検索・描画の基盤は anime-slide-generator から移植。
グラレコ風の装飾（吹き出し背景、マーカー風下線）を新規追加。

対応OS: macOS, Windows, Linux
"""

import math
import os
import platform
import urllib.request

from PIL import Image, ImageDraw, ImageFont

# ============================================
# クロスプラットフォーム フォント設定
# (anime-slide-generator から移植)
# ============================================

FONT_PATHS_MAC = {
    "bold": [
        "/System/Library/Fonts/ヒラギノ角ゴシック W8.ttc",
        "/System/Library/Fonts/ヒラギノ角ゴシック W7.ttc",
        "/Library/Fonts/Arial Unicode.ttf",
    ],
    "normal": [
        "/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc",
        "/System/Library/Fonts/ヒラギノ角ゴシック W4.ttc",
        "/Library/Fonts/Arial Unicode.ttf",
    ],
}

FONT_PATHS_WIN = {
    "bold": [
        "C:/Windows/Fonts/YuGothB.ttc",
        "C:/Windows/Fonts/meiryob.ttc",
        "C:/Windows/Fonts/meiryo.ttc",
        "C:/Windows/Fonts/msgothic.ttc",
    ],
    "normal": [
        "C:/Windows/Fonts/YuGothM.ttc",
        "C:/Windows/Fonts/meiryo.ttc",
        "C:/Windows/Fonts/msgothic.ttc",
    ],
}

FONT_PATHS_LINUX = {
    "bold": [
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
        "/usr/share/fonts/noto-cjk/NotoSansCJK-Bold.ttc",
        "/usr/share/fonts/google-noto-cjk/NotoSansCJK-Bold.ttc",
        "/usr/share/fonts/truetype/takao-gothic/TakaoGothic.ttf",
    ],
    "normal": [
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/google-noto-cjk/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/takao-gothic/TakaoGothic.ttf",
    ],
}

BUNDLED_FONT_DIR = os.path.join(os.path.dirname(__file__), "..", "fonts")
BUNDLED_FONT_URL = (
    "https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/Japanese/NotoSansCJKjp-Bold.otf"
)


def _get_os_type():
    """OSタイプを取得"""
    system = platform.system().lower()
    if system == "darwin":
        return "mac"
    if system == "windows":
        return "windows"
    return "linux"


def _download_bundled_font():
    """バンドルフォントをダウンロード（フォールバック用）"""
    os.makedirs(BUNDLED_FONT_DIR, exist_ok=True)
    font_path = os.path.join(BUNDLED_FONT_DIR, "NotoSansCJKjp-Bold.otf")

    if os.path.exists(font_path):
        return font_path

    try:
        print("[graphrec-overlay] 日本語フォントをダウンロード中...")
        urllib.request.urlretrieve(BUNDLED_FONT_URL, font_path)
        print(f"[graphrec-overlay] フォントをダウンロードしました: {font_path}")
        return font_path
    except Exception as e:
        print(f"[graphrec-overlay] フォントダウンロード失敗: {e}")
        return None


def find_font(style="bold"):
    """利用可能なフォントパスを検索"""
    os_type = _get_os_type()

    font_map = {
        "mac": FONT_PATHS_MAC,
        "windows": FONT_PATHS_WIN,
        "linux": FONT_PATHS_LINUX,
    }
    font_list = font_map.get(os_type, FONT_PATHS_LINUX).get(style, [])

    for font_path in font_list:
        if os.path.exists(font_path):
            return font_path

    bundled = os.path.join(BUNDLED_FONT_DIR, "NotoSansCJKjp-Bold.otf")
    if os.path.exists(bundled):
        return bundled

    downloaded = _download_bundled_font()
    if downloaded:
        return downloaded

    return None


def get_font(style="bold", size=48):
    """フォントを取得（クロスプラットフォーム対応）"""
    font_path = find_font(style)

    if font_path:
        try:
            return ImageFont.truetype(font_path, size)
        except Exception as e:
            print(f"[graphrec-overlay] フォント読み込みエラー: {e}")

    print("[graphrec-overlay] 警告: 日本語フォントが見つかりません。デフォルトフォントを使用。")
    return ImageFont.load_default()


# ============================================
# テキスト描画ユーティリティ
# ============================================

def draw_text_with_outline(draw, position, text, font, fill_color, outline_color, outline_width):
    """アウトライン付きテキストを描画"""
    x, y = position

    for dx in range(-outline_width, outline_width + 1):
        for dy in range(-outline_width, outline_width + 1):
            if dx != 0 or dy != 0:
                draw.text((x + dx, y + dy), text, font=font, fill=outline_color)

    draw.text((x, y), text, font=font, fill=fill_color)


def _auto_font_size(draw, text, max_width, style="bold", max_size=72, min_size=24):
    """テキストが max_width に収まるようフォントサイズを自動調整"""
    for size in range(max_size, min_size - 1, -2):
        font = get_font(style, size)
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        if text_width <= max_width:
            return font, size
    return get_font(style, min_size), min_size


def _wrap_text(draw, text, font, max_width):
    """テキストを max_width に収まるよう改行する"""
    lines = []
    current_line = ""

    for char in text:
        test_line = current_line + char
        bbox = draw.textbbox((0, 0), test_line, font=font)
        if bbox[2] - bbox[0] > max_width and current_line:
            lines.append(current_line)
            current_line = char
        else:
            current_line = test_line

    if current_line:
        lines.append(current_line)

    return lines


# ============================================
# グラレコ風装飾
# ============================================

def _draw_rounded_rect(draw, bbox, radius, fill, outline=None, outline_width=0):
    """角丸矩形を描画"""
    x1, y1, x2, y2 = bbox

    draw.rectangle([x1 + radius, y1, x2 - radius, y2], fill=fill)
    draw.rectangle([x1, y1 + radius, x2, y2 - radius], fill=fill)

    draw.pieslice([x1, y1, x1 + 2 * radius, y1 + 2 * radius], 180, 270, fill=fill)
    draw.pieslice([x2 - 2 * radius, y1, x2, y1 + 2 * radius], 270, 360, fill=fill)
    draw.pieslice([x1, y2 - 2 * radius, x1 + 2 * radius, y2], 90, 180, fill=fill)
    draw.pieslice([x2 - 2 * radius, y2 - 2 * radius, x2, y2], 0, 90, fill=fill)

    if outline and outline_width > 0:
        draw.rounded_rectangle(bbox, radius=radius, outline=outline, width=outline_width)


def _draw_marker_underline(draw, x, y, width, color, thickness=6):
    """マーカー風の下線を描画（少し波打つ手描き風）"""
    points = []
    steps = max(int(width / 8), 4)
    for i in range(steps + 1):
        px = x + (width * i / steps)
        wave = math.sin(i * 0.8) * 2
        py = y + wave
        points.append((px, py))

    for i in range(len(points) - 1):
        draw.line([points[i], points[i + 1]], fill=color, width=thickness)


# ============================================
# メインオーバーレイ関数
# ============================================

def overlay_graphrec_text(bg_path, output_path, text, theme=None):
    """グラレコ風テキストオーバーレイを適用

    Args:
        bg_path: テキストなし背景画像パス
        output_path: 出力画像パス
        text: オーバーレイするテキスト
        theme: カラーテーマ辞書 (None の場合はデフォルト)

    Returns:
        output_path
    """
    from graphrec_config import COLOR_THEMES, DEFAULT_THEME

    if theme is None:
        theme = COLOR_THEMES[DEFAULT_THEME]

    img = Image.open(bg_path).convert("RGBA")
    img_width, img_height = img.size

    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # テキストエリア設定（下部 25% をテロップゾーンに）
    telop_zone_top = int(img_height * 0.75)
    telop_zone_height = img_height - telop_zone_top
    padding_x = 40
    max_text_width = img_width - (padding_x * 2)

    # フォントサイズ自動調整
    font, font_size = _auto_font_size(draw, text, max_text_width, "bold", max_size=64, min_size=28)

    # テキスト折り返し
    lines = _wrap_text(draw, text, font, max_text_width)

    # 各行のサイズを計算
    line_heights = []
    line_widths = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        line_widths.append(bbox[2] - bbox[0])
        line_heights.append(bbox[3] - bbox[1])

    line_spacing = int(font_size * 0.3)
    total_text_height = sum(line_heights) + line_spacing * (len(lines) - 1)

    # 吹き出し風背景の描画
    bubble_padding_x = 30
    bubble_padding_y = 20
    max_line_width = max(line_widths) if line_widths else 0

    bubble_width = max_line_width + bubble_padding_x * 2
    bubble_height = total_text_height + bubble_padding_y * 2

    bubble_x = (img_width - bubble_width) // 2
    bubble_y = telop_zone_top + (telop_zone_height - bubble_height) // 2

    # 吹き出し背景（半透明ダーク + テーマカラーボーダー）
    bg_color = (20, 20, 30, 210)
    border_color = theme.get("text_bg", (255, 107, 107, 255))

    _draw_rounded_rect(
        draw,
        [bubble_x, bubble_y, bubble_x + bubble_width, bubble_y + bubble_height],
        radius=20,
        fill=bg_color,
        outline=border_color[:3] + (255,),
        outline_width=4,
    )

    # マーカー風下線（テーマカラー）
    underline_y = bubble_y + bubble_height - bubble_padding_y + 8
    _draw_marker_underline(
        draw,
        bubble_x + bubble_padding_x,
        underline_y,
        max_line_width,
        border_color[:3] + (200,),
        thickness=5,
    )

    # テキスト描画
    text_start_y = bubble_y + bubble_padding_y
    text_color = theme.get("text_color", (255, 255, 255, 255))
    outline_color = theme.get("outline_color", (0, 0, 0, 255))

    current_y = text_start_y
    for i, line in enumerate(lines):
        line_x = (img_width - line_widths[i]) // 2
        draw_text_with_outline(
            draw,
            (line_x, current_y),
            line,
            font,
            fill_color=text_color,
            outline_color=outline_color,
            outline_width=3,
        )
        current_y += line_heights[i] + line_spacing

    # オーバーレイを合成
    result = Image.alpha_composite(img, overlay)
    result = result.convert("RGB")
    result.save(output_path, quality=95)

    return output_path


# ============================================
# CLI
# ============================================

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 4:
        print("Usage: python graphrec_overlay.py <bg_image> <output> <text> [theme_key]")
        print("  theme_key: vivid_colorful, pastel_pop, natural_warm, bright_energy")
        sys.exit(1)

    bg_image = sys.argv[1]
    output = sys.argv[2]
    overlay_text = sys.argv[3]

    theme_dict = None
    if len(sys.argv) > 4:
        from graphrec_config import COLOR_THEMES
        theme_key = sys.argv[4]
        theme_dict = COLOR_THEMES.get(theme_key)

    overlay_graphrec_text(bg_image, output, overlay_text, theme=theme_dict)
    print(f"[graphrec-overlay] Generated: {output}")
