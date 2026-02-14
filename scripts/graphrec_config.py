#!/usr/bin/env python3
"""RPG VSL ジェネレーター — 16-bit RPGスタイル定数・カラーテーマ・プロンプトテンプレート

四次元ポケットLP原稿をベースにしたインタラクティブVSL用。
16-bit RPGワールドマップ風のドット絵を NanoBanana Pro で生成し、
Pillow で正確な日本語テロップを下部にオーバーレイする。

方針:
- 画像はRPGワールドマップの見下ろし視点で台本内容を視覚的に伝える
- モチーフ: 城, 森, 山脈, ドラゴン, 宝箱, 魔法陣
- 日本語テキストはメッセージウィンドウ風のフレームで表示
"""

# ============================================
# RPG スタイル定数
# ============================================

RPG_STYLE = (
    "16-bit RPG world map style illustration, "
    "detailed pixel art aesthetic, "
    "top-down bird's eye view perspective, "
    "retro SNES-era JRPG visual style, "
    "castles forests mountains rivers as world elements, "
    "saddle brown (#8B4513) parchment map background, "
    "light yellow (#FFFFE0) text elements, "
    "forest green (#228B22) and royal blue (#4169E1) accent colors, "
    "RPG message window style frame borders, "
    "bitmap font styled text elements, "
    "adventure medieval epic grand atmosphere, "
    "any visible text must be in correct accurate Japanese, "
    "9:16 vertical portrait format, 1080x1920 resolution"
)

# 後方互換性のため GRAPHREC_STYLE もエイリアスとして保持
GRAPHREC_STYLE = RPG_STYLE

# ============================================
# マンガスタイル定数（テキストなし — Pillow で後から正確にオーバーレイ）
# ============================================

MANGA_STYLE = (
    "dramatic Japanese manga illustration, "
    "bold black ink strokes with dynamic speed lines, "
    "halftone dot shading patterns, "
    "dark dramatic atmosphere with high contrast lighting, "
    "manga panel composition with cinematic angles, "
    "anime character art style with expressive faces, "
    "rich color palette with dramatic shadows, "
    "NO visible text, NO letters, NO words, NO writing in the image, "
    "clean illustration without any text overlay, "
    "9:16 vertical portrait format, 1080x1920 resolution"
)

# マンガスタイルを使用するシーンID
MANGA_SCENES = {"s01-hook", "cp1", "s10-final-cta"}

# ============================================
# カラーテーマ 4種（RPGテーマ）
# ============================================

COLOR_THEMES = {
    "castle_gold": {
        "name": "キャッスルゴールド",
        "primary": "#DAA520",
        "secondary": "#8B4513",
        "accent": "#FFD700",
        "text_bg": (139, 69, 19, 220),
        "text_color": (255, 255, 224, 255),
        "outline_color": (60, 30, 10, 255),
    },
    "forest_green": {
        "name": "フォレストグリーン",
        "primary": "#228B22",
        "secondary": "#2E8B57",
        "accent": "#90EE90",
        "text_bg": (34, 100, 34, 220),
        "text_color": (255, 255, 224, 255),
        "outline_color": (10, 50, 10, 255),
    },
    "royal_blue": {
        "name": "ロイヤルブルー",
        "primary": "#4169E1",
        "secondary": "#1E3A5F",
        "accent": "#87CEEB",
        "text_bg": (30, 58, 95, 220),
        "text_color": (255, 255, 224, 255),
        "outline_color": (20, 20, 80, 255),
    },
    "dragon_red": {
        "name": "ドラゴンレッド",
        "primary": "#B22222",
        "secondary": "#8B0000",
        "accent": "#FF4500",
        "text_bg": (139, 34, 34, 220),
        "text_color": (255, 255, 224, 255),
        "outline_color": (60, 10, 10, 255),
    },
    "manga_dark": {
        "name": "マンガダーク",
        "primary": "#FF4444",
        "secondary": "#1a1a2e",
        "accent": "#FF6B6B",
        "text_bg": (20, 20, 40, 220),
        "text_color": (255, 255, 255, 255),
        "outline_color": (10, 10, 20, 255),
    },
}

DEFAULT_THEME = "castle_gold"

# ============================================
# シーン別カラーテーママッピング
# ============================================

SCENE_THEME_MAP = {
    # 共通シーン
    "s01-hook": "manga_dark",
    "s02-hongyou": "castle_gold",
    "s03-ai-era": "royal_blue",
    "cp1": "manga_dark",
    # Branch A: 森の試練ルート
    "s04a-fukugyou": "forest_green",
    "s05a-ai-solution": "castle_gold",
    # Branch B: 城の拡張ルート
    "s04b-keiei": "royal_blue",
    "s05b-ai-expansion": "castle_gold",
    # Branch C: 魔法塔ルート
    "s04c-ai-skill": "royal_blue",
    "s05c-copipe": "castle_gold",
    # 共通シーン（後半）
    "s06-system": "castle_gold",
    "s07-seminar": "royal_blue",
    "s08-tokuten": "castle_gold",
    "s09-gaiyo": "forest_green",
    "s10-final-cta": "manga_dark",
}


def get_theme_for_scene(scene_id):
    """シーンIDに対応するカラーテーマを返す"""
    theme_key = SCENE_THEME_MAP.get(scene_id, DEFAULT_THEME)
    return COLOR_THEMES[theme_key]


# ============================================
# RPG版 シーンプロンプト（台本内容をRPGビジュアルで伝える）
# 各タプル: (scene_id, image_index, visual_description, overlay_text)
#
# _RAW_SCENE_DATA にビジュアル説明と日本語テキストを定義し、
# GRAPHREC_SCENE_IMAGES で自動的に RPG_STYLE と
# 日本語テキスト指示をプロンプトに統合する。
# ============================================

_RAW_SCENE_DATA = [
    # ==========================================
    # s01-hook: 速報 — AIが人間を超えた (35秒 → 10枚, マンガスタイル)
    # ==========================================
    ("s01-hook", "01",
     "dramatic manga close-up of a glowing smartphone screen showing a shocking breaking news alert, "
     "speed lines radiating outward from the screen, dark background with neon highlights, "
     "character's eyes wide with shock reflected in the screen light",
     "【速報】AIが人間を超えるアップデート完了"),
    ("s01-hook", "02",
     "dramatic overhead manga view of a futuristic city skyline being enveloped by digital energy waves, "
     "holographic data streams flowing between skyscrapers, cyberpunk atmosphere, "
     "the year 2026 implied by the advanced technology visible",
     "2026年、世界が変わった"),
    ("s01-hook", "03",
     "manga character with amazed expression watching a holographic system materialize in mid-air, "
     "glowing blue wireframes assembling into a complete application interface, "
     "sparkle effects and light particles surrounding the manifestation",
     "「こんなシステムが欲しい」が叶う"),
    ("s01-hook", "04",
     "dramatic manga illustration of digital architecture assembling itself automatically, "
     "gears and code fragments swirling into a complete system structure, "
     "robotic arms and AI constructs building at superhuman speed",
     "その場でシステムが完成する"),
    ("s01-hook", "05",
     "manga illustration of a modern office with holographic workflow diagrams flowing smoothly, "
     "documents and charts organizing themselves automatically, "
     "a relaxed business person watching as AI handles all processes",
     "業務効率化が即日で実現"),
    ("s01-hook", "06",
     "manga illustration of an automated sales funnel visualized as a golden pipeline, "
     "customers flowing through stages automatically, coins and revenue accumulating, "
     "AI robot assistants managing each stage of the process",
     "集客から販売まで完全自動化"),
    ("s01-hook", "07",
     "dramatic manga scene of a figure surrounded by dozens of floating holographic screens, "
     "each screen showing different global information sources, data streams connecting worldwide, "
     "the character orchestrating information like a conductor",
     "世界中の情報を瞬時にリサーチ"),
    ("s01-hook", "08",
     "manga illustration of a premium technology vault opening with dramatic golden light, "
     "advanced AI system hardware and software revealed inside, "
     "the sense of immense value and cutting-edge technology",
     "開発費1000万円以上のシステム"),
    ("s01-hook", "09",
     "dramatic manga illustration of a swirling dimensional portal with futuristic technology floating out, "
     "a pocket-sized device emitting an impossibly large holographic workspace, "
     "sci-fi meets fantasy with glowing energy and floating tools",
     "四次元ポケットが現実に"),
    ("s01-hook", "10",
     "dramatic manga scene of grand curtains pulling back to reveal a glowing high-tech stage, "
     "spotlights illuminating the centerpiece AI system, audience silhouettes in foreground, "
     "anticipation and excitement with dramatic lighting",
     "この動画で全てをお見せします"),

    # ==========================================
    # s02-hongyou: ダンジョンに囚われた勇者 (40秒 → 10枚)
    # ==========================================
    ("s02-hongyou", "01",
     "RPG warning message window on parchment, red exclamation mark, "
     "serious medieval proclamation, scroll with bold text",
     "本業以外の悩みは「本末転倒」です"),
    ("s02-hongyou", "02",
     "RPG hero character remembering their original dream, "
     "thought bubble showing their true calling, nostalgic warm glow",
     "あなたが本当にやりたかったこと"),
    ("s02-hongyou", "03",
     "Pixel art healer character in spa-like building, "
     "healing magic sparkles, happy customer NPC, warm atmosphere",
     "お客様を喜ばせたかった"),
    ("s02-hongyou", "04",
     "Pixel art tavern keeper serving food to happy adventurers, "
     "warm fireplace, delicious food icons, cozy RPG inn scene",
     "「美味しい」が聞きたかった"),
    ("s02-hongyou", "05",
     "Pixel art bard creating magical music scrolls, "
     "audience captivated, stars and hearts floating, creative joy",
     "最高の作品で感動させたかった"),
    ("s02-hongyou", "06",
     "Hero trapped in dark grinding dungeon, endless monster spawns, "
     "exhausted expression, SNS monster icons, repetitive hell loop",
     "でも現実は──雑務ダンジョン"),
    ("s02-hongyou", "07",
     "Gold coins pouring out of hero's pocket toward LP monster, "
     "50万 damage counter, painful financial drain visualization",
     "LP制作に何十万円も消える"),
    ("s02-hongyou", "08",
     "Hero forced to learn complex spell book, confusion symbols, "
     "multiple skill trees all half-completed, overwhelmed",
     "動画編集・マーケティングの修行"),
    ("s02-hongyou", "09",
     "Hero collapsed in dungeon surrounded by unfinished quests, "
     "dark oppressive atmosphere, chains of obligation",
     "やりたくないことに追われる毎日"),
    ("s02-hongyou", "10",
     "Light beam breaking into dungeon from above, "
     "hero looking up with hope, escape route appearing, "
     "RPG message window: quest complete soon",
     "それ、今日で終わりにしませんか？"),

    # ==========================================
    # s03-ai-era: 新世界の扉 (35秒 → 10枚)
    # ==========================================
    ("s03-ai-era", "01",
     "Elite RPG guild hall with high-level characters gathered, "
     "golden ranks displayed, powerful aura emanating, exclusive circle",
     "トップマーケッターたちが動き始めた"),
    ("s03-ai-era", "02",
     "RPG world map with only 0.5% of territory illuminated, "
     "rest in fog of war, tiny glowing area vs vast darkness",
     "日本でわずか0.5%だけが知っている"),
    ("s03-ai-era", "03",
     "Massive castle lord (500億 empire) examining magical artifact, "
     "sparkle eyes emoji, impressed reaction bubble, royal chamber",
     "500億円企業が驚き欲しがった"),
    ("s03-ai-era", "04",
     "AI community guild master studying the system scroll, "
     "amazed expression, golden seal of approval",
     "AIコミュニティ運営者も認めた"),
    ("s03-ai-era", "05",
     "Legendary item reveal on RPG pedestal, golden glow, "
     "fourth-dimensional pocket artifact floating with power aura",
     "「現実的な四次元ポケット」"),
    ("s03-ai-era", "06",
     "Hero relaxing in peaceful village while AI companion NPCs work, "
     "multiple helper characters doing tasks, serene atmosphere",
     "あなたは本業に集中するだけ"),
    ("s03-ai-era", "07",
     "Army of AI agent NPCs working 24/7, day/night cycle showing, "
     "tasks being completed continuously, tireless workers",
     "AIが24時間働き続けます"),
    ("s03-ai-era", "08",
     "RPG dialogue box with question mark, hero at crossroads, "
     "three glowing paths visible ahead, anticipation building",
     "ここであなたに質問です"),
    ("s03-ai-era", "09",
     "Three adventure paths branching on world map, "
     "each path glowing different color: green forest, blue castle, purple tower",
     "あなたが最も興味がある分野は？"),
    ("s03-ai-era", "10",
     "Close-up of three glowing quest markers on RPG map, "
     "hero's hand reaching toward choices, cosmic energy",
     "あなたの冒険を選んでください"),

    # ==========================================
    # cp1: 選択ポイント (5秒 → 3枚, マンガスタイル)
    # ==========================================
    ("cp1", "01",
     "dramatic manga crossroads scene with three illuminated paths stretching into different directions, "
     "each path glowing a different color: green for income, blue for business, purple for technology, "
     "a silhouetted figure standing at the center of the choice point",
     "3つの冒険ルートから選べ"),
    ("cp1", "02",
     "manga close-up of a determined character's face with three glowing option icons reflected in their eyes, "
     "dramatic lighting from below, speed lines converging toward the character, "
     "intense decision-making moment with high contrast shadows",
     "あなたの選択が未来を変える"),
    ("cp1", "03",
     "dramatic manga illustration of a large glowing question mark floating in the center, "
     "surrounded by three orbiting choice icons: a coin for income, a castle for business expansion, "
     "a gear for AI technology, cosmic energy swirling around them",
     "あなたが一番知りたいことは？"),

    # ==========================================
    # s04a-fukugyou: 副業の壁・森の魔物たち (25秒 → 8枚)
    # ==========================================
    ("s04a-fukugyou", "01",
     "Hero entering dark enchanted forest on RPG map, "
     "ominous atmosphere, thorny vines blocking path, "
     "side quest label floating above",
     "副業で収入を得たい気持ち"),
    ("s04a-fukugyou", "02",
     "SNS monster spawning in forest, social media icon shaped beast, "
     "daily grind counter showing endless respawns",
     "SNSを毎日更新する苦行"),
    ("s04a-fukugyou", "03",
     "LP制作 boss monster demanding 50万 gold tribute, "
     "hero's gold pouch shrinking, painful cost visualization",
     "LP制作に50万円以上かかる"),
    ("s04a-fukugyou", "04",
     "Skill tree showing video editing branch, months of grinding needed, "
     "experience bar barely moving, frustration symbols",
     "動画編集スキルに何ヶ月も"),
    ("s04a-fukugyou", "05",
     "Marketing lecture dungeon with endless textbook scrolls, "
     "hero drowning in information, never-ending study",
     "マーケティング講座の無限ループ"),
    ("s04a-fukugyou", "06",
     "Hero trying to fight forest monsters while carrying heavy day-job armor, "
     "dual burden visualization, exhaustion meter maxed",
     "本業をしながらは無理ゲー"),
    ("s04a-fukugyou", "07",
     "Graveyard of fallen adventurers in forest, failed side-quest tombstones, "
     "many have tried and failed, dark warning",
     "多くの人が挫折する"),
    ("s04a-fukugyou", "08",
     "Gold coins and hourglass sand draining away simultaneously, "
     "time and money vanishing into dark void, despair",
     "時間もお金もどんどん消えていく"),

    # ==========================================
    # s05a-ai-solution: 森を切り拓く伝説の剣 (20秒 → 7枚)
    # ==========================================
    ("s05a-ai-solution", "01",
     "Legendary AI sword appearing in golden light before hero in forest, "
     "game-changing weapon discovery, dramatic reveal",
     "四次元ポケットがあれば話は変わる"),
    ("s05a-ai-solution", "02",
     "Hero slashing LP monster with AI sword, 50万→1000 damage reduction, "
     "dramatic cost comparison counter, one-hit defeat",
     "LP制作費50万円→1000円以下"),
    ("s05a-ai-solution", "03",
     "AI companion NPC automatically posting to town bulletin boards, "
     "multiple social media icons being handled, auto-pilot mode",
     "SNS投稿が完全自動化"),
    ("s05a-ai-solution", "04",
     "Video scroll factory with AI workers mass producing content, "
     "counter showing 10-30 scrolls per day, magical automation",
     "動画を毎日30本自動量産"),
    ("s05a-ai-solution", "05",
     "Level 1 beginner villager receiving 400万 gold quest reward, "
     "shocked happy expression, dramatic success counter",
     "完全初心者が1ヶ月で400万円受注"),
    ("s05a-ai-solution", "06",
     "Forest monsters all defeated, clear path ahead, "
     "hero victorious with AI sword raised, sunlight breaking through",
     "副業の壁をAIで一気に突破"),
    ("s05a-ai-solution", "07",
     "Hero walking confidently on cleared forest path toward golden village, "
     "achievement unlocked banner, bright hopeful future",
     "あなたも突破できます"),

    # ==========================================
    # s04b-keiei: 経営の壁・城の防衛戦 (25秒 → 8枚)
    # ==========================================
    ("s04b-keiei", "01",
     "Grand castle under siege on RPG world map, "
     "enemy forces surrounding walls, resource meters dropping",
     "経営者としてビジネスを拡大したい"),
    ("s04b-keiei", "02",
     "Castle interior showing empty guard posts, "
     "few soldiers stretched thin, understaffed crisis",
     "人材不足・業務の属人化"),
    ("s04b-keiei", "03",
     "Castle treasury showing massive outgoing expenses, "
     "gold flowing out to marketing mercenaries, system builders, payroll",
     "マーケティングに数百万円の支出"),
    ("s04b-keiei", "04",
     "Castle engineers being replaced by magical constructs, "
     "old craftsmen watching their work automated",
     "システム開発に数千万円"),
    ("s04b-keiei", "05",
     "Heavy gold chains weighing down castle, monthly tribute counter, "
     "endless recurring costs visualization",
     "人件費が毎月重くのしかかる"),
    ("s04b-keiei", "06",
     "Traditional castle workers (designers writers editors) fading away, "
     "AI golems replacing them, evolution in progress",
     "従来のスキルがAIに代替"),
    ("s04b-keiei", "07",
     "Outsourced merchant guild being outpaced by instant AI magic, "
     "speed comparison: old caravan vs teleportation",
     "外注よりAIの方が速い時代"),
    ("s04b-keiei", "08",
     "Castle walls cracking under multiple pressures, "
     "urgent need for reinforcement, critical moment",
     "経営の壁は年々高くなる"),

    # ==========================================
    # s05b-ai-expansion: 城の大改築 (20秒 → 7枚)
    # ==========================================
    ("s05b-ai-expansion", "01",
     "Legendary AI architect NPC arriving at castle with blueprints, "
     "golden construction plans, dramatic entrance",
     "四次元ポケットは最強の武器"),
    ("s05b-ai-expansion", "02",
     "AI golems rapidly processing castle paperwork and admin tasks, "
     "efficiency meter shooting to max, same-day completion",
     "事務作業をAIが即日処理"),
    ("s05b-ai-expansion", "03",
     "Magical scout birds flying to all corners of world map, "
     "returning with intelligence reports, information network",
     "業界情報を世界中から自動収集"),
    ("s05b-ai-expansion", "04",
     "Castle marketplace transforming into fully automated trading hub, "
     "customers flowing in, sales happening automatically",
     "集客から販売まで一気通貫で自動化"),
    ("s05b-ai-expansion", "05",
     "Massive castle lord NPC (500億 badge) giving thumbs up approval, "
     "speech bubble: これは欲しい, royal endorsement",
     "500億円企業の経営者が即答"),
    ("s05b-ai-expansion", "06",
     "Top marketer character (70億 badge) declaring prophecy, "
     "golden text banner: 次の10年を決める",
     "70億円マーケッターが断言"),
    ("s05b-ai-expansion", "07",
     "Castle expanding 10x in dramatic time-lapse, "
     "towers growing, walls expanding, kingdom flourishing",
     "あなたのビジネスも10倍に拡大"),

    # ==========================================
    # s04c-ai-skill: AI技術の壁・魔法塔の試練 (25秒 → 8枚)
    # ==========================================
    ("s04c-ai-skill", "01",
     "Tall magical tower on RPG map, glowing with arcane energy, "
     "hero looking up at imposing structure, wisdom quest",
     "AI技術を身につけて未来を切り拓く"),
    ("s04c-ai-skill", "02",
     "RPG message window showing: 最も賢い選択, "
     "wisdom star icon, golden text approval",
     "それは最も賢い選択です"),
    ("s04c-ai-skill", "03",
     "Tower entrance blocked by complex programming rune puzzles, "
     "hero confused by code symbols, barrier effect",
     "プログラミングの知識が必要？"),
    ("s04c-ai-skill", "04",
     "Library of foreign language spell books, English scrolls, "
     "hero struggling to read, language barrier visualization",
     "英語の論文を読む壁"),
    ("s04c-ai-skill", "05",
     "Expensive magic academy with 高額 tuition sign, "
     "golden gates with price tag, financial barrier",
     "高額なスクールに通う必要？"),
    ("s04c-ai-skill", "06",
     "Graveyard of students who gave up on tower climb, "
     "abandoned spell books scattered, many failed attempts",
     "多くの人がここで諦める"),
    ("s04c-ai-skill", "07",
     "Magical transformation happening to tower entrance, "
     "old barriers dissolving, new easier path appearing",
     "AIの世界はもう変わりました"),
    ("s04c-ai-skill", "08",
     "Tower doors opening wide with welcoming golden light, "
     "no requirements sign, everyone welcome banner",
     "知っていますか？"),

    # ==========================================
    # s05c-copipe: 魔法の杖 (20秒 → 7枚)
    # ==========================================
    ("s05c-copipe", "01",
     "RPG status screen showing: 素人OK 才能不要 能力不問, "
     "all restrictions crossed out, freedom declaration",
     "素人OK、才能不要、能力不問"),
    ("s05c-copipe", "02",
     "Hero using simple copy-paste magic scroll to create complex system, "
     "easy spell casting, no training needed",
     "コピペだけでシステム開発"),
    ("s05c-copipe", "03",
     "Hero speaking idea into magical crystal, app materializing instantly, "
     "voice-to-creation magic, instant generation",
     "アイデアを伝えるだけでアプリ誕生"),
    ("s05c-copipe", "04",
     "Website castle being built instantly from voice command, "
     "magical construction completing in seconds",
     "サイトもシステムもその場で完成"),
    ("s05c-copipe", "05",
     "Capability meter showing 95% filled, nearly everything possible, "
     "RPG power gauge visualization, impressive range",
     "パソコンでできることの95%を実現"),
    ("s05c-copipe", "06",
     "Grand system architecture revealed as magical constellation, "
     "multi-agent system diagram in fantasy style, epic scale",
     "マルチエージェントシステムの全貌"),
    ("s05c-copipe", "07",
     "Legendary magical staff (四次元ポケット) floating before hero, "
     "golden aura, ultimate tool acquired, level up moment",
     "1000万円相当のシステムが手に入る"),

    # ==========================================
    # s06-system: 伝説の装備一覧 (35秒 → 10枚)
    # ==========================================
    ("s06-system", "01",
     "Grand RPG equipment shop opening, legendary items on display, "
     "golden shop keeper NPC, epic inventory reveal",
     "システムがあなたの代わりにやること"),
    ("s06-system", "02",
     "LP creation potion: old price 50万 crossed out, new price 1000, "
     "dramatic price slash effect, bargain celebration",
     "LP制作費50万円→AIで1000円以下"),
    ("s06-system", "03",
     "Video scroll production factory with conveyor belt, "
     "counter showing 10-30 per day, magical mass production",
     "動画教材を毎日30本自動量産"),
    ("s06-system", "04",
     "AI messenger birds auto-posting to village bulletin boards, "
     "social media town crier NPCs working autonomously",
     "SNS投稿をネタから投稿まで完全自動"),
    ("s06-system", "05",
     "Complete merchant automation pipeline on RPG map, "
     "customers attracted → guided → converted → served, all auto",
     "マーケティングを一気通貫で自動化"),
    ("s06-system", "06",
     "Scout network covering entire world map with research nodes, "
     "information flowing back to hero's base, global intel",
     "リサーチを世界中から自動収集"),
    ("s06-system", "07",
     "AI clerk golems handling all paperwork in castle office, "
     "same-day completion stamps, efficiency maximized",
     "事務作業をAIが即日処理"),
    ("s06-system", "08",
     "Hero's schedule clearing up, free time meter filling, "
     "relaxation icons appearing, burden lifting",
     "あなたの手が空く"),
    ("s06-system", "09",
     "Hourglass being reversed, time flowing back to hero, "
     "magical time recovery, golden sand returning",
     "時間が戻る"),
    ("s06-system", "10",
     "Hero happily focused on their true craft (healing/cooking/creating), "
     "AI companions handling everything else, peaceful scene",
     "本業に集中できる"),

    # ==========================================
    # s07-seminar: クエストボード (35秒 → 10枚)
    # ==========================================
    ("s07-seminar", "01",
     "Grand adventurer guild quest board with legendary quests posted, "
     "golden border quests, 120-180分 duration tag, FREE badge",
     "無料セミナーですべて公開します"),
    ("s07-seminar", "02",
     "Quest card: AI集客 auto-magnet pulling customers, "
     "magnetic field around village, automatic attraction",
     "集客を完全自動化するAI活用"),
    ("s07-seminar", "03",
     "Quest card: Kindle books auto-generating from magic press, "
     "compound interest growth curve, book factory",
     "Kindle複利無限出版システム"),
    ("s07-seminar", "04",
     "Quest card: Foreign scrolls auto-translating via magic decoder, "
     "overseas content → Japanese conversion, revenue flowing",
     "海外コンテンツ自動翻訳で収益化"),
    ("s07-seminar", "05",
     "Quest card: Short video mass production with AI assembly line, "
     "dozens of video scrolls being created simultaneously",
     "ショート動画を大量に自動生成"),
    ("s07-seminar", "06",
     "Quest card: Voice command creating apps instantly, "
     "idea bubble → finished magical artifact, infinite generation",
     "アイデアだけでアプリが生まれる"),
    ("s07-seminar", "07",
     "Quest card: UTAGE/Lステップ subscription chains breaking free, "
     "hero escaping monthly payment dungeon, liberation",
     "高額ツールが不要になる理由"),
    ("s07-seminar", "08",
     "Quest card: World-class research scout network, "
     "premium intelligence gathering, knowledge = power",
     "世界最高レベルのリサーチ技術"),
    ("s07-seminar", "09",
     "Quest card: AI writing all copy automatically, "
     "10億円 marketer seal of approval, no writing needed",
     "AIマーケティングシステム"),
    ("s07-seminar", "10",
     "All quest cards glowing together on board, complete set reveal, "
     "grand showcase of all capabilities combined",
     "これらすべてを包み隠さず公開"),

    # ==========================================
    # s08-tokuten: 宝箱の中身 (30秒 → 8枚)
    # ==========================================
    ("s08-tokuten", "01",
     "Legendary treasure chest glowing on RPG pedestal, "
     "golden light beams, sparkle effects, excitement building",
     "セミナー参加特典をご紹介"),
    ("s08-tokuten", "02",
     "Treasure chest opening revealing first prize, "
     "Gemini gem icons ×20 floating out, magical artifacts",
     "特典1: Gemini専用Gem 20個"),
    ("s08-tokuten", "03",
     "Twenty different colored gems displayed in ornate case, "
     "each gem labeled with business/marketing function, premium tools",
     "マーケティング特化カスタムツール"),
    ("s08-tokuten", "04",
     "Hero equipping gems as power-up accessories, "
     "immediate stat boost, ready to use today badge",
     "今日から即戦力として使える"),
    ("s08-tokuten", "05",
     "Golden VIP ticket materializing from treasure chest, "
     "exclusive royal seal, limited access pass, premium glow",
     "特典2: VIP優先案内の権利"),
    ("s08-tokuten", "06",
     "Castle gates with CLOSED sign (2025年12月募集停止), "
     "rare opportunity emphasizing scarcity, last chance",
     "募集を完全停止したVIP枠"),
    ("s08-tokuten", "07",
     "VIP ticket being handed only to seminar attendees, "
     "exclusive delivery animation, special treatment",
     "セミナー参加者だけの限定権利"),
    ("s08-tokuten", "08",
     "Both treasures displayed together: 20 gems + VIP ticket, "
     "ultimate participation reward package, golden display",
     "Gem 20個 + VIP優先権"),

    # ==========================================
    # s09-gaiyo: 冒険の準備 (20秒 → 5枚)
    # ==========================================
    ("s09-gaiyo", "01",
     "RPG preparation screen with equipment and stats display, "
     "seminar details in message window: 120-180分 duration",
     "セミナー概要: 120〜180分"),
    ("s09-gaiyo", "02",
     "Online magic portal (Zoom crystal ball) for remote participation, "
     "comfortable home setting, easy access visualization",
     "オンライン・Zoom開催"),
    ("s09-gaiyo", "03",
     "FREE participation badge glowing with no-cost shield, "
     "zero gold requirement, barrier-free entry, welcoming",
     "参加費は完全無料"),
    ("s09-gaiyo", "04",
     "Seats counter showing 100/100 available, limited enrollment, "
     "先着 first-come badge, urgency timer starting",
     "先着100名様限定"),
    ("s09-gaiyo", "05",
     "Safety shield protecting participant, risk-free guarantee badge, "
     "no damage possible, gentle encouragement message window",
     "損することは一切ありません"),

    # ==========================================
    # s10-final-cta: 新世界への門 (35秒 → 10枚, マンガスタイル)
    # ==========================================
    ("s10-final-cta", "01",
     "dramatic manga character breaking free from heavy chains and shackles, "
     "chains shattering with speed lines and impact effects, "
     "liberation scene with bright light flooding from above, powerful emotional moment",
     "面倒なことは全部AIに"),
    ("s10-final-cta", "02",
     "peaceful manga scene of a smiling person enjoying creative work at a sunlit desk, "
     "while AI robot assistants handle paperwork and tasks in the background, "
     "warm soft lighting with cherry blossoms floating outside the window",
     "やりたいことだけを楽しんでください"),
    ("s10-final-cta", "03",
     "dramatic manga illustration of a hand reaching for a glowing golden scroll of insider knowledge, "
     "the scroll radiating powerful light in a dark room, "
     "dramatic shadows and highlights emphasizing the importance of the information",
     "先行案内で知る権利を掴め"),
    ("s10-final-cta", "04",
     "split-panel manga composition: left side showing a dark confused figure in shadows, "
     "right side showing an enlightened figure bathed in golden light with technology, "
     "dramatic contrast between ignorance and knowledge with a sharp dividing line",
     "知っているか知らないかで全てが変わる"),
    ("s10-final-cta", "05",
     "dramatic manga scene of a small illuminated elite group standing on a peak above clouds, "
     "vast masses of silhouettes remaining below in darkness, "
     "the chosen few glowing with special knowledge, exclusive and powerful atmosphere",
     "世界0.5%の先行者になれるチャンス"),
    ("s10-final-cta", "06",
     "manga hourglass with sand nearly empty, last golden grains falling dramatically, "
     "speed lines and impact effects radiating from the hourglass, "
     "intense urgency atmosphere with clock elements shattering around it",
     "今この瞬間だけのチャンス"),
    ("s10-final-cta", "07",
     "manga crowd of silhouettes rushing toward a glowing limited-capacity venue entrance, "
     "a digital counter above the door decreasing rapidly, "
     "dramatic perspective from inside looking at the incoming crowd",
     "先着100名・席は埋まっていきます"),
    ("s10-final-cta", "08",
     "dramatic manga close-up of a hand reaching to tap a glowing green circular button, "
     "energy ripples emanating from the button, index finger about to make contact, "
     "decisive action moment with dramatic lighting and speed lines",
     "今すぐLINE友だち追加"),
    ("s10-final-cta", "09",
     "warm manga scene of a welcoming reception with open arms and celebratory atmosphere, "
     "confetti falling, warm golden lighting, friendly faces greeting the viewer, "
     "red carpet leading toward a bright welcoming interior",
     "あなたのご参加をお待ちしています"),
    ("s10-final-cta", "10",
     "epic manga finale of a character stepping through a brilliant dimensional portal, "
     "the new world visible beyond glowing with golden light and advanced technology, "
     "dramatic back-lit silhouette with cape flowing, triumphant heroic pose",
     "新世界への冒険が、今始まる"),
]

# 自動統合: マンガシーンはテキスト指示なし（Pillow で後からオーバーレイ）
# RPGシーンは従来通り日本語テキスト指示を含める
GRAPHREC_SCENE_IMAGES = [
    (sid, idx,
     f"{desc}, {MANGA_STYLE}" if sid in MANGA_SCENES
     else f"{desc}, with Japanese text '{text}', {RPG_STYLE}",
     text)
    for sid, idx, desc, text in _RAW_SCENE_DATA
]
