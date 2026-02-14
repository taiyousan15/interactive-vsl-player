#!/usr/bin/env python3
"""グラレコ VSL ジェネレーター — スタイル定数・カラーテーマ・プロンプトテンプレート

グラフィックレコーディング風のイラストを NanoBanana Pro で生成し、
Pillow で正確な日本語テロップを下部にオーバーレイする。

方針:
- 画像は台本の内容を視覚的に伝える（テキスト含有OK）
- 画像内にテキストが含まれる場合は正確な日本語を指定
- Pillow オーバーレイは下部テロップとして確実な日本語表示を保証する
"""

# ============================================
# グラレコ スタイル定数
# ============================================

GRAPHREC_STYLE = (
    "hand-drawn graphic recording illustration style, "
    "sketch-like aesthetic with colorful markers and pens, "
    "icons and visual metaphors, arrows and flow indicators, "
    "speech bubbles and thought clouds, "
    "doodles and decorative elements, "
    "organic imperfect hand-drawn lines, "
    "vibrant saturated colors, multiple colors per element, "
    "white or light background, "
    "clean visual hierarchy, professional infographic quality, "
    "asymmetric dynamic layout, generous white space, "
    "any visible text must be in correct accurate Japanese, "
    "9:16 vertical portrait format, 1080x1920 resolution"
)

# ============================================
# カラーテーマ 4種
# ============================================

COLOR_THEMES = {
    "vivid_colorful": {
        "name": "ビビッドカラフル",
        "primary": "#FF6B6B",
        "secondary": "#4ECDC4",
        "accent": "#FFE66D",
        "text_bg": (255, 107, 107, 200),
        "text_color": (255, 255, 255, 255),
        "outline_color": (80, 30, 30, 255),
    },
    "pastel_pop": {
        "name": "パステルポップ",
        "primary": "#FFB5E8",
        "secondary": "#B5DEFF",
        "accent": "#E7FFAC",
        "text_bg": (181, 222, 255, 200),
        "text_color": (40, 40, 80, 255),
        "outline_color": (20, 20, 60, 255),
    },
    "natural_warm": {
        "name": "ナチュラルウォーム",
        "primary": "#D4A373",
        "secondary": "#CCD5AE",
        "accent": "#FAEDCD",
        "text_bg": (212, 163, 115, 200),
        "text_color": (255, 255, 255, 255),
        "outline_color": (80, 50, 20, 255),
    },
    "bright_energy": {
        "name": "ブライトエナジー",
        "primary": "#FF5722",
        "secondary": "#FFC107",
        "accent": "#4CAF50",
        "text_bg": (255, 87, 34, 200),
        "text_color": (255, 255, 255, 255),
        "outline_color": (100, 30, 10, 255),
    },
}

DEFAULT_THEME = "vivid_colorful"

# ============================================
# シーン別カラーテーママッピング
# ============================================

SCENE_THEME_MAP = {
    "s01-hook": "bright_energy",
    "s02-son": "vivid_colorful",
    "s03-two-types": "vivid_colorful",
    "cp1": "bright_energy",
    "s04a-practice": "natural_warm",
    "s05a-ceo": "vivid_colorful",
    "s06a-beginner": "pastel_pop",
    "s07a-top": "vivid_colorful",
    "s08a-join": "bright_energy",
    "s04b-gap": "vivid_colorful",
    "s05b-bubble": "bright_energy",
    "s06b-revolution": "vivid_colorful",
    "s07b-05percent": "pastel_pop",
    "s08b-stillintime": "bright_energy",
    "s04c-pocket": "pastel_pop",
    "s05c-evolution": "natural_warm",
    "s06c-seminar": "vivid_colorful",
    "s07c-bonus": "bright_energy",
    "s08c-goevolve": "vivid_colorful",
    "s10-final-cta": "bright_energy",
}


def get_theme_for_scene(scene_id):
    """シーンIDに対応するカラーテーマを返す"""
    theme_key = SCENE_THEME_MAP.get(scene_id, DEFAULT_THEME)
    return COLOR_THEMES[theme_key]


# ============================================
# グラレコ版 シーンプロンプト（台本内容を視覚で伝える）
# 各タプル: (scene_id, image_index, visual_description, overlay_text)
#
# _RAW_SCENE_DATA にビジュアル説明と日本語テキストを定義し、
# GRAPHREC_SCENE_IMAGES で自動的に GRAPHREC_STYLE と
# 日本語テキスト指示をプロンプトに統合する。
# ============================================

_RAW_SCENE_DATA = [
    # ==========================================
    # s01-hook: 2026年、AIが人間を超えた (28秒 → 10枚)
    # ==========================================
    ("s01-hook", "01",
     "Breaking news broadcast graphics, urgent alert visual with red and white flash, "
     "digital screen cracking effect, dark studio background",
     "速報: 2026年、AIが人間を超えた"),
    ("s01-hook", "02",
     "AI brain surpassing human brain, holographic AI entity rising above human silhouette, "
     "golden energy burst, futuristic atmosphere",
     "AIが人間の知能を超越する瞬間"),
    ("s01-hook", "03",
     "Person speaking to glowing computer screen, complete software system materializing "
     "in holographic form, magical creation moment",
     "ひと言つぶやくだけでシステムが完成"),
    ("s01-hook", "04",
     "Business efficiency automation, workflow arrows streamlining from chaos to order, "
     "gears and data flowing smoothly, office background",
     "業務効率化が一瞬で実現"),
    ("s01-hook", "05",
     "Marketing automation funnel, customers flowing through sales pipeline, "
     "conversion icons, digital marketing dashboard",
     "マーケティングも完全自動化"),
    ("s01-hook", "06",
     "Global information network, world map with data streams connecting continents, "
     "AI scanning and collecting information, blue and gold glow",
     "世界中の情報を瞬時にリサーチ"),
    ("s01-hook", "07",
     "Dramatic investment visualization, stacks of money transforming into digital code "
     "and systems, development cost concept",
     "開発費1000万円以上のシステム"),
    ("s01-hook", "08",
     "Magical fourth-dimensional pocket opening with golden light, various tools and "
     "systems emerging, wonder and amazement",
     "四次元ポケットが現実に"),
    ("s01-hook", "09",
     "Marketing revolution, old textbooks crumbling while AI systems rise, "
     "new era declaration, dramatic transformation",
     "マーケティング不要の時代へ"),
    ("s01-hook", "10",
     "Golden stage curtains opening to reveal the future, person standing at entrance "
     "of new era, invitation atmosphere",
     "この動画で全てをお見せします"),

    # ==========================================
    # s02-son: 孫正義の衝撃宣言 (32秒 → 11枚)
    # ==========================================
    ("s02-son", "01",
     "Narrator with honest gesture, hands up in sincere expression, "
     "dark moody background, trustworthy atmosphere",
     "僕の言葉を信じないでください"),
    ("s02-son", "02",
     "Powerful business leader silhouette at grand keynote stage, massive corporate logo, "
     "thousands of audience, dramatic spotlights",
     "ソフトバンクワールド基調講演"),
    ("s02-son", "03",
     "Holographic display showing massive investment, money flowing into tech companies "
     "worldwide, global technology map",
     "AI投資に数兆円を投入"),
    ("s02-son", "04",
     "Grand keynote stage, speaker at podium with confident gesture, "
     "massive screen behind, audience captivated",
     "衝撃の宣言をした"),
    ("s02-son", "05",
     "Giant multiplier number floating above keynote stage, exponential growth curve "
     "visualization, golden energy radiating",
     "AIは1万倍になる"),
    ("s02-son", "06",
     "One person surrounded by many AI agent avatars in circle formation, "
     "glowing digital assistants, futuristic command center",
     "1人が1000体のAIエージェントを従える"),
    ("s02-son", "07",
     "Current AI logos being dwarfed by massive larger AI entity looming above, "
     "dramatic scale comparison",
     "今のAIの1万倍の性能"),
    ("s02-son", "08",
     "Person commanding army of holographic AI agents at futuristic workstation, "
     "agents flying out to complete tasks",
     "全てのタスクをAIが代行"),
    ("s02-son", "09",
     "Massive investment being pushed into AI, businessman with determined face, "
     "dramatic stakes visualization",
     "数兆円を賭けた本気の投資"),
    ("s02-son", "10",
     "Close-up of determined business leader face with fire in eyes, "
     "clenched fist, epic declaration moment",
     "覚悟ある宣言"),
    ("s02-son", "11",
     "Grand finale of keynote speech, speaker with arms raised, "
     "audience giving standing ovation, golden light",
     "AIの未来は確定している"),

    # ==========================================
    # s03-two-types: 2つの種類の人類 (25秒 → 9枚)
    # ==========================================
    ("s03-two-types", "01",
     "Person looking sideways with skeptical dismissive expression, "
     "speech bubble gesture, dark cynical atmosphere",
     "「どうせ」と言う人たち"),
    ("s03-two-types", "02",
     "Person actively denying evolution with hands crossed in X shape, "
     "innovation icons bouncing off barrier",
     "進化を否定する人間"),
    ("s03-two-types", "03",
     "Person building invisible walls around themselves, chains of self-limitation "
     "forming, dark oppressive atmosphere",
     "自ら未来を制限する"),
    ("s03-two-types", "04",
     "Dramatic frame split in half, dark side and light side, "
     "cosmic division of humanity",
     "2つの種類の人類"),
    ("s03-two-types", "05",
     "Left half person walking into darkness with crossed arms, right half person "
     "running into golden light, dramatic split",
     "拒絶する者と進化に食らいつく者"),
    ("s03-two-types", "06",
     "Person aggressively grabbing at evolution with fierce determination, "
     "biting into opportunity energy",
     "進化に食らいつく"),
    ("s03-two-types", "07",
     "Japan map with urgent need highlighted, rising sun with AI elements, "
     "national urgency atmosphere",
     "日本に一番必要なこと"),
    ("s03-two-types", "08",
     "Direct confrontation pose pointing at viewer, dramatic question mark, "
     "intense atmosphere",
     "あなたはどちらの側ですか？"),
    ("s03-two-types", "09",
     "Two diverging paths at crossroads, left path dark and crumbling, "
     "right path golden and ascending, choice moment",
     "今、選択の時"),

    # ==========================================
    # cp1: 選択ポイント (4秒 → 2枚)
    # ==========================================
    ("cp1", "01",
     "Three glowing doors in dramatic corridor, left red with shield, "
     "center gold with trophy, right blue with gear, choice moment",
     "3つのルートから選んでください"),
    ("cp1", "02",
     "Close-up of person's hand reaching toward three glowing choices, "
     "energy radiating from fingertips, cosmic background",
     "あなたの選択が未来を変える"),

    # ==========================================
    # s04a-practice: 信じて実践した結果 (33秒 → 11枚)
    # ==========================================
    ("s04a-practice", "01",
     "Ordinary person with humble expression, sincere atmosphere, "
     "honest confession scene",
     "特別な天才ではありません"),
    ("s04a-practice", "02",
     "Person deeply trusting and following mentor, believing and taking action, "
     "light of faith shining",
     "信じて、実践した"),
    ("s04a-practice", "03",
     "Extreme work intensity, person at desk with sweat drops, clock showing long hours, "
     "effort visualization",
     "毎日15時間×3ヶ月"),
    ("s04a-practice", "04",
     "Money counter showing high consulting fees, expensive knowledge investment "
     "visualization",
     "月額300万円のコンサルティング"),
    ("s04a-practice", "05",
     "Multiple premium AI community membership cards and VIP badges, "
     "high-level networking",
     "最高レベルのAIコミュニティに参加"),
    ("s04a-practice", "06",
     "Personal consulting session with top marketer, one-on-one intensive learning, "
     "golden knowledge transfer",
     "50億円マーケッターから直接指導"),
    ("s04a-practice", "07",
     "Corporate executive meeting room with top-secret AI information, "
     "elite business circle",
     "トップ経営者のみが知る情報"),
    ("s04a-practice", "08",
     "Long experience timeline, massive promotion track record counter, "
     "accumulated expertise visualization",
     "SNS歴24年、プロモーション累計30億円"),
    ("s04a-practice", "09",
     "All experience and money converging into single point, "
     "dramatic funnel of investment",
     "全てを注ぎ込んだ"),
    ("s04a-practice", "10",
     "Grand system reveal, completed AI system emerging from all investment and effort, "
     "golden glow",
     "1000万円以上かけて完成したシステム"),
    ("s04a-practice", "11",
     "Final proud presentation of completed system, person standing before creation "
     "with arms open",
     "これがそのシステムです"),

    # ==========================================
    # s05a-ceo: 500億企業経営者が即答 (23秒 → 8枚)
    # ==========================================
    ("s05a-ceo", "01",
     "System being demonstrated on screen, moment of anticipation before reactions, "
     "dramatic pause",
     "このシステムを見せた結果..."),
    ("s05a-ceo", "02",
     "Wealthy company CEO with sparkle eyes, immediate approval reaction, "
     "golden frame of amazement",
     "500億企業の経営者「これは欲しい」"),
    ("s05a-ceo", "03",
     "AI community owner jaw dropping in shock, amazement reaction",
     "月額150万円AIコミュニティ主宰者が驚愕"),
    ("s05a-ceo", "04",
     "Top marketer pointing firmly with confident declaration gesture, "
     "professional authority",
     "70億円マーケッター「次の10年を決める」"),
    ("s05a-ceo", "05",
     "Multiple billionaire executives nodding in agreement, "
     "unanimous approval scene",
     "全員が価値を認めた"),
    ("s05a-ceo", "06",
     "Group of elite business people pointing at system, "
     "golden approval atmosphere",
     "日本のトップ経営者が太鼓判"),
    ("s05a-ceo", "07",
     "Scale showing massive business experience, weight of endorsement, "
     "credibility visualization",
     "数百億〜数千億の実績が裏付け"),
    ("s05a-ceo", "08",
     "Golden seal of approval from top business leaders, "
     "collective endorsement badge",
     "本物の価値が証明された"),

    # ==========================================
    # s06a-beginner: 初心者が400万円受注 (26秒 → 9枚)
    # ==========================================
    ("s06a-beginner", "01",
     "Shocking surprise reaction, exclamation marks, dramatic twist moment",
     "さらに驚くべきことに"),
    ("s06a-beginner", "02",
     "Complete beginner with zero programming experience, confused face looking at code",
     "プログラミング経験ゼロの完全初心者"),
    ("s06a-beginner", "03",
     "Same beginner now confidently receiving large contract from corporate client, "
     "dramatic transformation",
     "たった1ヶ月で400万円を受注"),
    ("s06a-beginner", "04",
     "Cost comparison showing tiny input becoming massive output, "
     "dramatic ROI visualization",
     "1000円が100万円に化けた"),
    ("s06a-beginner", "05",
     "Monthly support contract being signed, recurring revenue stream visualization",
     "月額5万円のサポート契約も獲得"),
    ("s06a-beginner", "06",
     "Price comparison crash visualization, old high price crossed out, "
     "new low price glowing",
     "LP制作費50万円が1000円以下に"),
    ("s06a-beginner", "07",
     "Assembly line of video content, many videos being automatically produced, "
     "factory of content",
     "1日10〜30本の動画を自動生成"),
    ("s06a-beginner", "08",
     "Transformation complete, former beginner surrounded by achievements, "
     "confident pose",
     "完全初心者が1ヶ月で変貌"),
    ("s06a-beginner", "09",
     "Montage of all success results combined, achievements floating together",
     "400万受注+100万売上+継続収益+動画自動化"),

    # ==========================================
    # s07a-top: トップマーケッターの証言 (21秒 → 7枚)
    # ==========================================
    ("s07a-top", "01",
     "Elite group of high earners, confident poses, premium business attire, "
     "golden aura of success",
     "年収5000万〜10億円の実力者たち"),
    ("s07a-top", "02",
     "Person expressing relief and gratitude, sincere testimony, warm atmosphere",
     "「早くスタートできて良かった」"),
    ("s07a-top", "03",
     "Person demonstrating unlimited capability, tools materializing around them",
     "「このシステムがあれば何でもできる」"),
    ("s07a-top", "04",
     "Investment return calculation showing massive ROI, profit celebration",
     "「元は余裕で取りました」"),
    ("s07a-top", "05",
     "Common thread connecting all successful people, "
     "golden connecting thread visualization",
     "共通点: 進化に真正面から食らいついた"),
    ("s07a-top", "06",
     "People diving headfirst into evolution without hesitation, "
     "golden splash of success",
     "迷わず飛び込んだ人たちの結果"),
    ("s07a-top", "07",
     "Final testimonial montage, multiple successful people holding results, "
     "unified message",
     "行動した人だけが手にした成果"),

    # ==========================================
    # s08a-join: 先行者の仲間入りへ (17秒 → 6枚)
    # ==========================================
    ("s08a-join", "01",
     "Pointing at viewer with warm encouraging gesture, inviting atmosphere",
     "あなたにも同じチャンスがあります"),
    ("s08a-join", "02",
     "Limited seats seminar hall with golden VIP seats, urgency counter, "
     "premium exclusive event",
     "先着30名限定セミナー"),
    ("s08a-join", "03",
     "System being revealed on grand stage, complete system presentation, "
     "audience amazed",
     "1000万円のシステムを完全公開"),
    ("s08a-join", "04",
     "Online meeting interface showing session duration, "
     "professional virtual event setup",
     "Zoom開催・120〜180分"),
    ("s08a-join", "05",
     "FREE participation badge glowing brightly, golden ticket, no cost barrier",
     "参加費は無料"),
    ("s08a-join", "06",
     "Seats filling up rapidly with countdown, last seats available, "
     "urgency atmosphere",
     "席は埋まっていきます"),

    # ==========================================
    # s04b-gap: 1万倍の差がつく世界 (24秒 → 8枚)
    # ==========================================
    ("s04b-gap", "01",
     "Massive multiplier number appearing with ominous dark energy, "
     "capability gap visualization",
     "1万倍の差がつく世界"),
    ("s04b-gap", "02",
     "Two people starting at same point, dramatic gap widening between them",
     "今始める人と8年後の人の差"),
    ("s04b-gap", "03",
     "One year gap showing massive difference, person ahead looking down at "
     "tiny figure far below",
     "1年で1000倍の差"),
    ("s04b-gap", "04",
     "Three year gap showing astronomical distance between early and late adopters",
     "3年で1万倍の差に到達"),
    ("s04b-gap", "05",
     "Dismissive person with casual gesture, dark ominous clouds gathering behind",
     "「どうせ、まだ早い」と言う人"),
    ("s04b-gap", "06",
     "Person unconsciously building walls around own future, "
     "self-limitation chains, prison of own making",
     "自分の未来に壁を作っている"),
    ("s04b-gap", "07",
     "Business leader warning with stern face, red danger sign, "
     "serious atmosphere",
     "「進化を否定する者は未来を制限する」"),
    ("s04b-gap", "08",
     "Bold red warning visual, alarm bells ringing, urgent danger atmosphere",
     "これは警告です"),

    # ==========================================
    # s05b-bubble: 過去のバブルの教訓 (27秒 → 9枚)
    # ==========================================
    ("s05b-bubble", "01",
     "IT bubble wave circa 2000, dot-com era icons, moderate-sized wave, "
     "early internet era",
     "2000年: ITバブル"),
    ("s05b-bubble", "02",
     "Cryptocurrency bubble wave with Bitcoin symbols, larger wave, "
     "crypto gold rush era",
     "仮想通貨バブル"),
    ("s05b-bubble", "03",
     "SNS bubble wave with social media icons, growing wave size",
     "SNSバブル"),
    ("s05b-bubble", "04",
     "All three past bubbles as small waves compared to MASSIVE AI tsunami "
     "towering above, dramatic scale comparison",
     "AIの波は過去のどれよりも巨大"),
    ("s05b-bubble", "05",
     "Person riding golden crest of wave triumphantly, early adopter success, "
     "surfing the wave",
     "波に乗った者が巨万の富を得た"),
    ("s05b-bubble", "06",
     "Confident declaration, scale comparison chart, new era proclamation",
     "過去のどのバブルとも別物"),
    ("s05b-bubble", "07",
     "Marketing textbooks and skills crumbling and dissolving, revolution, "
     "old ways disappearing",
     "マーケティングが不要になる"),
    ("s05b-bubble", "08",
     "Skills and certificates fading, dramatic devaluation of traditional knowledge",
     "数百万円の学びが無価値に"),
    ("s05b-bubble", "09",
     "Massive gap between wave riders at top and those left behind at bottom, "
     "dramatic separation",
     "差は計り知れません"),

    # ==========================================
    # s06b-revolution: マーケティング不要革命 (20秒 → 7枚)
    # ==========================================
    ("s06b-revolution", "01",
     "Business person leveling up with AI boost arrows, growth acceleration",
     "経営者: さらに上を目指せる"),
    ("s06b-revolution", "02",
     "Startup entrepreneur launching with rocket boost, rapid launch visualization",
     "起業家: 一気に加速できる"),
    ("s06b-revolution", "03",
     "Side hustle worker relaxed while AI works, automation delegation",
     "副業: AIに自動で任せる"),
    ("s06b-revolution", "04",
     "AI reaching into every industry sector, healthcare education retail, "
     "all sectors penetrated",
     "全ジャンルにAIが浸透"),
    ("s06b-revolution", "05",
     "Freelance workers watching jobs being replaced by AI, concerned expressions, "
     "job displacement",
     "デザイナー・動画編集者・ライターの仕事が消える"),
    ("s06b-revolution", "06",
     "Skills and expertise being absorbed and replicated by AI, "
     "dramatic replacement scene",
     "スキルがAIに代替される"),
    ("s06b-revolution", "07",
     "Split dramatic scene: LEFT dark with threat, RIGHT golden with opportunity, "
     "bold contrast",
     "脅威か、最大のチャンスか"),

    # ==========================================
    # s07b-05percent: 世界0.5%の先行者 (18秒 → 6枚)
    # ==========================================
    ("s07b-05percent", "01",
     "Tiny illuminated group vs massive group in darkness, "
     "elite awareness visualization",
     "世界でわずか0.5%だけが気づいている"),
    ("s07b-05percent", "02",
     "Finger pointing at viewer, empowering moment, golden highlight",
     "あなたは先行者の資格を持っている"),
    ("s07b-05percent", "03",
     "Exponential growth curve, dramatic acceleration, numbers multiplying rapidly",
     "1年で1000倍の成長"),
    ("s07b-05percent", "04",
     "Calendar showing one year from now with door closing, "
     "last opportunity visualization",
     "もう同じチャンスはない"),
    ("s07b-05percent", "05",
     "Airplane on runway accelerating for takeoff, speed lines, engines blazing",
     "離陸前の最後の直線"),
    ("s07b-05percent", "06",
     "Critical moment of acceleration or staying grounded forever, "
     "now-or-never atmosphere",
     "今乗らなければ永遠に飛び立てない"),

    # ==========================================
    # s08b-stillintime: 今なら、まだ間に合う (17秒 → 6枚)
    # ==========================================
    ("s08b-stillintime", "01",
     "Ray of hope breaking through dark clouds, golden light piercing darkness",
     "まだチャンスがあります"),
    ("s08b-stillintime", "02",
     "Limited seats with countdown timer, premium seminar hall, seats glowing",
     "先着30名限定"),
    ("s08b-stillintime", "03",
     "System being unveiled, complete revelation moment, audience gasping",
     "1000万円のシステムを完全公開"),
    ("s08b-stillintime", "04",
     "FREE badge and online meeting interface, accessibility, no barriers",
     "参加費は無料・オンライン"),
    ("s08b-stillintime", "05",
     "Seats rapidly filling with countdown, urgency increasing, people rushing",
     "席は埋まっていきます"),
    ("s08b-stillintime", "06",
     "Person taking decisive action, strong determination, "
     "hand reaching out to grab opportunity",
     "今すぐ行動してください"),

    # ==========================================
    # s04c-pocket: なぜ四次元ポケットなのか (24秒 → 8枚)
    # ==========================================
    ("s04c-pocket", "01",
     "Magical glowing pocket opening, wonder and mystery, blue cosmic energy",
     "四次元ポケットとは"),
    ("s04c-pocket", "02",
     "Capability meter filling up to 95 percent, holographic display, "
     "impressive coverage",
     "パソコンでできることの95%を実現"),
    ("s04c-pocket", "03",
     "Person casually speaking to computer, ideas forming as speech bubbles, "
     "desires materializing",
     "話しかけるだけで何でも叶う"),
    ("s04c-pocket", "04",
     "Equal access badge, everyone welcome, democratization of technology concept",
     "能力もスキルも才能も一切不要"),
    ("s04c-pocket", "05",
     "Website system being created on the spot, code materializing from voice command, "
     "instant creation",
     "サイトもシステムもその場で完成"),
    ("s04c-pocket", "06",
     "Business workflow being optimized instantly, chaotic to streamlined, "
     "same-day results",
     "業務改善が即日で実現"),
    ("s04c-pocket", "07",
     "Complete sales automation pipeline, customer acquisition to delivery, "
     "full automation",
     "集客から販売までAIが代行"),
    ("s04c-pocket", "08",
     "Grand reveal of realistic fourth-dimensional pocket concept, "
     "all capabilities orbiting central portal",
     "現実的な四次元ポケット"),

    # ==========================================
    # s05c-evolution: 無限に進化するシステム (22秒 → 8枚)
    # ==========================================
    ("s05c-evolution", "01",
     "Multiplier visualization every year, exponential growth curve shooting upward, "
     "dramatic scaling",
     "1年で1000倍に進化"),
    ("s05c-evolution", "02",
     "Eight-year timeline reaching maximum, astronomical capability growth, "
     "matching prediction",
     "8年で1万倍に到達"),
    ("s05c-evolution", "03",
     "Infinite evolution spiral ascending through dimensions, system continuously "
     "upgrading, perpetual growth",
     "無限に進化し続けるシステム"),
    ("s05c-evolution", "04",
     "Yesterday impossible becoming today easy, transformation from red X to "
     "green checkmark",
     "昨日できなかったことが今日できる"),
    ("s05c-evolution", "05",
     "Stressed esthetician forced to post on social media instead of beauty work, "
     "frustration",
     "本業に集中できないエステティシャン"),
    ("s05c-evolution", "06",
     "Exhausted coach spending energy on content creation instead of coaching, "
     "burnout",
     "LP作成に疲弊するコーチ"),
    ("s05c-evolution", "07",
     "Chains of unnecessary tasks breaking apart, person being liberated, "
     "freedom moment, wings spreading",
     "不要な作業から解放される"),
    ("s05c-evolution", "08",
     "Person freed and happy doing only what they love, AI handling everything else, "
     "blissful",
     "あなたを解放します"),

    # ==========================================
    # s06c-seminar: セミナーで公開する内容 (25秒 → 9枚)
    # ==========================================
    ("s06c-seminar", "01",
     "Grand curtain opening on seminar stage, dramatic reveal moment",
     "すべてお見せします"),
    ("s06c-seminar", "02",
     "AI customer acquisition system, zero ad cost, customers flowing automatically",
     "広告費ゼロで自動集客"),
    ("s06c-seminar", "03",
     "Book publishing system, books being automatically created, "
     "revenue accumulating",
     "Kindle出版で自動収益"),
    ("s06c-seminar", "04",
     "Global information transformer, foreign content converted automatically",
     "海外情報を自動で日本語に変換"),
    ("s06c-seminar", "05",
     "Short video mass production factory, dozens of videos generated daily by AI",
     "ショート動画を大量自動生成"),
    ("s06c-seminar", "06",
     "App being created from spoken idea alone, voice-to-app visualization, "
     "instant development",
     "アイデアを話すだけでアプリ完成"),
    ("s06c-seminar", "07",
     "World-class research system with AI analyzing vast data, "
     "premium intelligence",
     "世界最高峰のリサーチ技術"),
    ("s06c-seminar", "08",
     "AI handling all copywriting, no writing needed badge",
     "ライティング不要マーケティング"),
    ("s06c-seminar", "09",
     "All capabilities combined in grand showcase, every feature displayed "
     "together, complete package",
     "そのすべてを公開します"),

    # ==========================================
    # s07c-bonus: 参加特典 (20秒 → 7枚)
    # ==========================================
    ("s07c-bonus", "01",
     "Treasure chest opening with golden light, exciting bonus reveal, "
     "sparkle effects",
     "参加特典をご紹介"),
    ("s07c-bonus", "02",
     "Twenty gem icons arranged in premium display, custom AI tools showcase",
     "特典1: Geminiカスタム Gem 20個"),
    ("s07c-bonus", "03",
     "Custom marketing tools being demonstrated, specialized tool for each "
     "business need",
     "マーケティング・ビジネス特化AI"),
    ("s07c-bonus", "04",
     "Golden VIP ticket with exclusive stamp, premium access rights, "
     "limited and valuable",
     "特典2: VIP優先案内権"),
    ("s07c-bonus", "05",
     "Recruitment closure sign with red CLOSED stamp, scarcity emphasis",
     "2025年12月に募集完全停止"),
    ("s07c-bonus", "06",
     "VIP priority notification being handed to seminar participant only, "
     "exclusive delivery",
     "セミナー参加者だけに案内"),
    ("s07c-bonus", "07",
     "Both bonuses displayed together as premium package, "
     "ultimate participation reward",
     "Gem 20個 + VIP優先権"),

    # ==========================================
    # s08c-goevolve: 進化を取りに行く (14秒 → 5枚)
    # ==========================================
    ("s08c-goevolve", "01",
     "Seminar details display, clean professional information layout",
     "セミナー詳細: 120〜180分・Zoom開催"),
    ("s08c-goevolve", "02",
     "FREE participation with person limit counter, urgency and value",
     "参加費無料・先着30名"),
    ("s08c-goevolve", "03",
     "Person with hopeful expression considering the offer, "
     "gentle encouragement",
     "少しでも気になるなら"),
    ("s08c-goevolve", "04",
     "Guarantee badge, risk-free assurance, trust building atmosphere",
     "損することは決してありません"),
    ("s08c-goevolve", "05",
     "Person reaching up to grab golden opportunity wave, "
     "seizing the moment, triumphant reach",
     "1万倍の波に乗れるチャンスを掴め"),

    # ==========================================
    # s10-final-cta: 今すぐLINE登録 (35秒 → 12枚)
    # ==========================================
    ("s10-final-cta", "01",
     "Business leader profound question being asked, cosmic division of humanity, "
     "philosophical moment",
     "2つの種類の人類"),
    ("s10-final-cta", "02",
     "Two paths splitting dramatically in cosmic space, left into darkness, "
     "right into light",
     "進化を拒絶する者と食らいつく者"),
    ("s10-final-cta", "03",
     "Direct question to viewer, intense eye contact, "
     "dramatic personal challenge",
     "あなたはどちらですか？"),
    ("s10-final-cta", "04",
     "Warning quote etched in stone, serious warning atmosphere",
     "進化を否定する者は未来を制限する"),
    ("s10-final-cta", "05",
     "Emotional reflection moment, person deep in thought, "
     "introspective atmosphere",
     "この言葉を聞いて何を感じましたか？"),
    ("s10-final-cta", "06",
     "Dismissive person closing browser tab, representing wrong choice, "
     "dark fade out",
     "「どうせ、まだ早い」で閉じる人"),
    ("s10-final-cta", "07",
     "Exponential curve with urgency, clock ticking, "
     "opportunity window shrinking",
     "1年で1000倍の差がつく"),
    ("s10-final-cta", "08",
     "Calendar one year from now with door firmly closed, missed opportunity",
     "もう同じチャンスはない"),
    ("s10-final-cta", "09",
     "Global awareness stat, exclusive advantage right now, "
     "golden ticket moment",
     "世界0.5%の先行者になれる今"),
    ("s10-final-cta", "10",
     "Seats countdown with urgency pulse, seats filling rapidly, "
     "rush to register",
     "先着30名・席は埋まっていきます"),
    ("s10-final-cta", "11",
     "Massive LINE app icon glowing bright green with invitation energy, "
     "hand pressing add button",
     "今すぐLINE友だち追加"),
    ("s10-final-cta", "12",
     "Warm welcome scene, open arms invitation, golden future awaiting, "
     "hopeful ending",
     "あなたのご参加をお待ちしています"),
]

# 自動統合: ビジュアル説明 + 日本語テキスト指示 + グラレコスタイル
GRAPHREC_SCENE_IMAGES = [
    (sid, idx,
     f"{desc}, with Japanese text '{text}', {GRAPHREC_STYLE}",
     text)
    for sid, idx, desc, text in _RAW_SCENE_DATA
]
