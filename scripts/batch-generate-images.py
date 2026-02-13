#!/usr/bin/env python3
"""NanoBanana Pro (Gemini) で台本フレーズ対応画像を一括生成

各シーンのナレーションを3秒区間に分割し、
各区間の内容に対応した個別プロンプトで画像を生成する。

使い方:
  python3 scripts/batch-generate-images.py
  python3 scripts/batch-generate-images.py --scene s01-hook  # 1シーンだけ
  python3 scripts/batch-generate-images.py --dry-run          # プレビューのみ
  python3 scripts/batch-generate-images.py --start-from s03   # 途中から再開
"""

import argparse
import os
import subprocess
import sys
import time

NANOBANANA_DIR = os.path.expanduser("~/.claude/skills/nanobanana-pro")
OUTPUT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "public", "images", "scenes"
)

MANGA_STYLE = (
    "dramatic Japanese manga illustration style, bold black ink outlines, "
    "cel-shading, screentone halftone textures, dynamic speed lines, "
    "high contrast shadows, vibrant saturated colors, emotional intensity, "
    "professional manga art quality, 9:16 vertical portrait format, "
    "1080x1920 resolution"
)

# ============================================================
# 全20シーン × 台本フレーズ対応プロンプト
# 各タプル: (scene_id, image_index, prompt)
# 3秒間隔で切り替え → シーン秒数 / 3 ≒ 必要枚数
# ============================================================
SCENE_IMAGES = [
    # ==========================================
    # s01-hook: 2026年、AIが人間を超えた (28秒 → 10枚)
    # ==========================================
    ("s01-hook", "01", f"BREAKING NEWS flash screen with bold red and white Japanese headline text, urgent broadcast graphics, digital screen cracking, dark studio background, {MANGA_STYLE}"),
    ("s01-hook", "02", f"Dramatic moment of AI brain surpassing human brain, holographic AI entity rising above human silhouette, golden energy burst at the crossing point, February 2026 date stamp, {MANGA_STYLE}"),
    ("s01-hook", "03", f"Person whispering to a glowing computer screen, and a complete software system materializing instantly in holographic form before their eyes, magical creation moment, {MANGA_STYLE}"),
    ("s01-hook", "04", f"Business efficiency automation scene, multiple workflow arrows streamlining from chaos to order, gears and data flowing smoothly, office background, {MANGA_STYLE}"),
    ("s01-hook", "05", f"Marketing automation funnel visualization, customers flowing through automated sales pipeline, money and conversion icons, digital marketing dashboard, {MANGA_STYLE}"),
    ("s01-hook", "06", f"Global information network, world map with data streams connecting continents, AI scanning and collecting information from everywhere, blue and gold glow, {MANGA_STYLE}"),
    ("s01-hook", "07", f"Dramatic investment counter showing 10 million yen (1000万円), stacks of money transforming into digital code and systems, development cost visualization, {MANGA_STYLE}"),
    ("s01-hook", "08", f"Magical fourth-dimensional pocket opening with golden light, various tools and systems emerging from it like Doraemon's pocket, wonder and amazement, {MANGA_STYLE}"),
    ("s01-hook", "09", f"Marketing revolution declaration, old marketing textbooks crumbling while AI systems rise above them, text 'マーケティング不要' floating in golden letters, {MANGA_STYLE}"),
    ("s01-hook", "10", f"Dramatic curtain reveal moment, golden stage curtains opening to show the future, person standing at the entrance of a new era, invitation to watch, {MANGA_STYLE}"),

    # ==========================================
    # s02-son: 孫正義の衝撃宣言 (32秒 → 11枚)
    # ==========================================
    ("s02-son", "01", f"Serious face of narrator saying 'Don't believe my words', hands up in honest gesture, dark moody background, sincere expression, {MANGA_STYLE}"),
    ("s02-son", "02", f"Powerful business leader silhouette at grand SoftBank World keynote stage, massive corporate logo behind, thousands of audience members, dramatic purple and gold spotlights, {MANGA_STYLE}"),
    ("s02-son", "03", f"Holographic display showing trillions of yen in AI investment, money flowing into tech companies worldwide, global technology map with investment arrows, {MANGA_STYLE}"),
    ("s02-son", "04", f"Grand keynote stage moment of declaration, speaker at podium with confident gesture, massive screen behind showing bold statement, audience captivated, {MANGA_STYLE}"),
    ("s02-son", "05", f"Giant holographic number '10000x' (1万倍) floating above keynote stage, AI capability multiplier visualization, exponential growth curve, golden energy radiating, {MANGA_STYLE}"),
    ("s02-son", "06", f"One person surrounded by 1000 AI agent avatars in a circle formation, glowing digital assistants ready to serve, futuristic command center, {MANGA_STYLE}"),
    ("s02-son", "07", f"Current ChatGPT and Gemini logos being dwarfed by a massive 10000x larger AI entity looming above them, scale comparison, dramatic size difference, {MANGA_STYLE}"),
    ("s02-son", "08", f"Person commanding army of 1000 holographic AI agents at a futuristic workstation, agents flying out to complete tasks simultaneously, {MANGA_STYLE}"),
    ("s02-son", "09", f"Massive pile of trillion-yen bills being pushed into AI investment, businessman with determined face making bold bet, dramatic stakes visualization, {MANGA_STYLE}"),
    ("s02-son", "10", f"Close-up of determined business leader face with fire in eyes, clenched fist, text overlay '覚悟ある宣言' (declaration of resolve), epic moment, {MANGA_STYLE}"),
    ("s02-son", "11", f"Grand finale of keynote speech, speaker with arms raised, audience giving standing ovation, golden light pouring from above, triumphant moment, {MANGA_STYLE}"),

    # ==========================================
    # s03-two-types: 2つの種類の人類 (25秒 → 9枚)
    # ==========================================
    ("s03-two-types", "01", f"Person looking sideways with skeptical dismissive expression, speech bubble saying 'どうせ' (whatever), dark cynical atmosphere, {MANGA_STYLE}"),
    ("s03-two-types", "02", f"Person actively denying evolution with hands crossed in X shape, innovation icons bouncing off invisible barrier, self-imposed wall, {MANGA_STYLE}"),
    ("s03-two-types", "03", f"Person building invisible walls around themselves, chains of self-limitation forming, dark oppressive atmosphere, self-created prison, {MANGA_STYLE}"),
    ("s03-two-types", "04", f"Dramatic proclamation scene, bold text '2つの種類の人類' splitting the frame in half, dark side and light side, cosmic division, {MANGA_STYLE}"),
    ("s03-two-types", "05", f"Left half showing person rejecting evolution walking into darkness with crossed arms, right half showing person embracing evolution running into golden light, dramatic split, {MANGA_STYLE}"),
    ("s03-two-types", "06", f"Person aggressively grabbing at evolution with teeth bared and determined eyes, 食らいつく (biting into it) energy, fierce determination, {MANGA_STYLE}"),
    ("s03-two-types", "07", f"Japan map with urgent need highlighted, text '日本に一番必要なこと', rising sun with AI elements, national urgency, {MANGA_STYLE}"),
    ("s03-two-types", "08", f"Direct confrontation pose pointing at viewer asking 'あなたはどちらの側ですか？' (Which side are you on?), dramatic question mark, {MANGA_STYLE}"),
    ("s03-two-types", "09", f"Two diverging paths with person standing at crossroads, left path dark and crumbling, right path golden and ascending, final choice moment, {MANGA_STYLE}"),

    # ==========================================
    # cp1: 選択ポイント (4秒 → 2枚)
    # ==========================================
    ("cp1", "01", f"Three glowing manga-style doors in dramatic corridor, left door blazing red with shield emblem for '実績', center door shining gold with trophy for '危機感', right door electric blue with gear for 'システム', intense choice moment, {MANGA_STYLE}"),
    ("cp1", "02", f"Close-up of person's hand reaching toward three glowing choices, energy radiating from fingertips, dramatic moment of decision, cosmic background, {MANGA_STYLE}"),

    # ==========================================
    # s04a-practice: 信じて実践した結果 (33秒 → 11枚)
    # ==========================================
    ("s04a-practice", "01", f"Honest confession scene, ordinary person with humble expression, text '特別な天才ではありません' (I'm not a genius), sincere atmosphere, {MANGA_STYLE}"),
    ("s04a-practice", "02", f"Person deeply trusting and following mentor's words, believing and taking action, light of faith shining, determined start of journey, {MANGA_STYLE}"),
    ("s04a-practice", "03", f"Extreme work intensity, person at desk with sweat drops, clock showing 15 hours, coffee cups piled up, 3-month calendar burning with effort, {MANGA_STYLE}"),
    ("s04a-practice", "04", f"Money counter showing 3 million yen monthly consulting fees, expensive knowledge investment visualization, bills flowing into brain, {MANGA_STYLE}"),
    ("s04a-practice", "05", f"Multiple premium AI community membership cards and VIP badges, high-level networking visualization, exclusive access, {MANGA_STYLE}"),
    ("s04a-practice", "06", f"Personal consulting session with 5-billion-yen marketer, one-on-one intensive learning, golden knowledge transfer, {MANGA_STYLE}"),
    ("s04a-practice", "07", f"Corporate executive meeting room with top-secret AI information being shared, elite business circle, confidential briefing, {MANGA_STYLE}"),
    ("s04a-practice", "08", f"24 years of SNS experience timeline, 3 billion yen promotion track record counter, accumulated expertise visualization, {MANGA_STYLE}"),
    ("s04a-practice", "09", f"All experience and money converging into a single point, dramatic funnel of investment, 10 million yen development cost at center, {MANGA_STYLE}"),
    ("s04a-practice", "10", f"Grand system reveal, completed AI system emerging from all the investment and effort, golden glow of achievement, triumphant moment, {MANGA_STYLE}"),
    ("s04a-practice", "11", f"Final proud presentation of the completed system, person standing before their creation with arms open, 'これがシステムです' (This is the system), {MANGA_STYLE}"),

    # ==========================================
    # s05a-ceo: 500億企業経営者が即答 (23秒 → 8枚)
    # ==========================================
    ("s05a-ceo", "01", f"System being demonstrated on screen, moment of anticipation before reactions, dramatic pause, {MANGA_STYLE}"),
    ("s05a-ceo", "02", f"50-billion-yen company CEO with wide sparkle eyes saying 'これは欲しい' (I want this) immediately, instant approval reaction, golden frame, {MANGA_STYLE}"),
    ("s05a-ceo", "03", f"AI community owner with 1.5 million yen membership fee, jaw dropping in shock, speech bubble 'こんなものが存在するのか' (Such a thing exists?), {MANGA_STYLE}"),
    ("s05a-ceo", "04", f"7-billion-yen top marketer pointing firmly declaring 'これは次の10年を決める技術だ' (This technology defines the next decade), confident gesture, {MANGA_STYLE}"),
    ("s05a-ceo", "05", f"Multiple billionaire executives nodding in agreement, unanimous approval scene, manga panel grid of amazed reactions, {MANGA_STYLE}"),
    ("s05a-ceo", "06", f"Group of elite business people all pointing at the system saying '価値を認めた' (acknowledged the value), golden approval stamps, {MANGA_STYLE}"),
    ("s05a-ceo", "07", f"Scale showing tens of billions and hundreds of billions in business experience, weight of their endorsement, credibility visualization, {MANGA_STYLE}"),
    ("s05a-ceo", "08", f"Golden seal of approval from Japan's top business leaders, collective endorsement, premium quality verification badge, {MANGA_STYLE}"),

    # ==========================================
    # s06a-beginner: 初心者が400万円受注 (26秒 → 9枚)
    # ==========================================
    ("s06a-beginner", "01", f"Shocking surprise reaction, exclamation marks, 'さらに驚くべきことに' (Even more surprisingly), dramatic twist moment, {MANGA_STYLE}"),
    ("s06a-beginner", "02", f"Complete beginner person with zero programming experience label, confused face looking at code, before transformation, {MANGA_STYLE}"),
    ("s06a-beginner", "03", f"Same beginner now confidently receiving 4-million-yen contract from corporate client, dramatic before-after, just 1 month later, {MANGA_STYLE}"),
    ("s06a-beginner", "04", f"Cost comparison showing 1000 yen input becoming 1 million yen output, dramatic ROI visualization, money multiplying, {MANGA_STYLE}"),
    ("s06a-beginner", "05", f"Monthly 50,000 yen support contract being signed, recurring revenue stream visualization, passive income flow, {MANGA_STYLE}"),
    ("s06a-beginner", "06", f"LP creation cost dropping from 500,000 yen to under 1,000 yen, price crash visualization, old price crossed out, new price glowing, {MANGA_STYLE}"),
    ("s06a-beginner", "07", f"Assembly line of video content, 10 to 30 videos per day being automatically produced, video icons multiplying rapidly, factory of content, {MANGA_STYLE}"),
    ("s06a-beginner", "08", f"Transformation complete, former beginner now surrounded by achievements, success metrics floating around, confident pose, {MANGA_STYLE}"),
    ("s06a-beginner", "09", f"Montage of all beginner success results, 4M contract + 1M sales + recurring revenue + video automation, combined achievements, {MANGA_STYLE}"),

    # ==========================================
    # s07a-top: トップマーケッターの証言 (21秒 → 7枚)
    # ==========================================
    ("s07a-top", "01", f"Elite group of high earners 50M to 1B yen annual income, confident poses, premium business attire, golden aura of success, {MANGA_STYLE}"),
    ("s07a-top", "02", f"Person expressing relief and gratitude saying '早くスタートできて良かった' (Glad I started early), sincere testimony, {MANGA_STYLE}"),
    ("s07a-top", "03", f"Person demonstrating unlimited capability, 'このシステムがあれば何でもできる' (With this system I can do anything), tools materializing, {MANGA_STYLE}"),
    ("s07a-top", "04", f"Investment return calculation showing massive ROI, '元は余裕で取りました' (Easily recovered investment), profit celebration, {MANGA_STYLE}"),
    ("s07a-top", "05", f"Common thread visualization, all successful people sharing same trait: embracing evolution head-on, golden connecting thread, {MANGA_STYLE}"),
    ("s07a-top", "06", f"People diving headfirst into evolution without hesitation, brave leap of faith, golden splash of success upon landing, {MANGA_STYLE}"),
    ("s07a-top", "07", f"Final testimonial montage, multiple successful people holding their results, unified message of success through embracing change, {MANGA_STYLE}"),

    # ==========================================
    # s08a-join: 先行者の仲間入りへ (17秒 → 6枚)
    # ==========================================
    ("s08a-join", "01", f"Pointing at viewer with warm encouraging gesture, 'あなたにも同じチャンスがあります' (You have the same chance), inviting atmosphere, {MANGA_STYLE}"),
    ("s08a-join", "02", f"Limited 30 seats seminar hall with golden glowing VIP seats, '先着30名限定' urgency counter, premium exclusive event, {MANGA_STYLE}"),
    ("s08a-join", "03", f"10-million-yen system being revealed on grand stage, complete system presentation, audience amazed, {MANGA_STYLE}"),
    ("s08a-join", "04", f"Zoom seminar interface showing 120-180 minutes, online meeting setup, professional virtual event, {MANGA_STYLE}"),
    ("s08a-join", "05", f"FREE participation badge glowing brightly, '参加費は無料' (Free admission), golden ticket, no cost barrier, {MANGA_STYLE}"),
    ("s08a-join", "06", f"Seats filling up rapidly with countdown, '席は埋まっていきます' urgency, last seats available, join the pioneers, {MANGA_STYLE}"),

    # ==========================================
    # s04b-gap: 1万倍の差がつく世界 (24秒 → 8枚)
    # ==========================================
    ("s04b-gap", "01", f"Massive number 10000x appearing with ominous dark energy, AI capability gap visualization, threatening scale of difference, {MANGA_STYLE}"),
    ("s04b-gap", "02", f"Two people starting at same point, one starting now vs one starting 8 years later, dramatic 10000x gap widening between them, {MANGA_STYLE}"),
    ("s04b-gap", "03", f"1-year gap showing 1000x difference, person ahead looking down at tiny figure far below, vertiginous height difference, {MANGA_STYLE}"),
    ("s04b-gap", "04", f"3-year gap approaching 10000x, astronomical distance between early and late adopters, cosmic scale separation, {MANGA_STYLE}"),
    ("s04b-gap", "05", f"Dismissive person saying 'どうせ、まだ早い' (It's too early), casual dismissal gesture, dark ominous clouds gathering behind, {MANGA_STYLE}"),
    ("s04b-gap", "06", f"Person unconsciously building walls around their own future, self-limitation chains forming, prison of their own making, {MANGA_STYLE}"),
    ("s04b-gap", "07", f"Quote from business leader warning '自ら進化を否定する人間は、自らの未来を制限する', stern warning face, red danger sign, {MANGA_STYLE}"),
    ("s04b-gap", "08", f"Bold red WARNING text 'これは警告です' (This is a warning), alarm bells ringing, urgent danger atmosphere, final warning, {MANGA_STYLE}"),

    # ==========================================
    # s05b-bubble: 過去のバブルの教訓 (27秒 → 9枚)
    # ==========================================
    ("s05b-bubble", "01", f"IT bubble wave visualization circa 2000, dot-com era icons, moderate-sized wave, early internet gold rush, {MANGA_STYLE}"),
    ("s05b-bubble", "02", f"Cryptocurrency bubble wave with Bitcoin symbols, larger wave than IT bubble, crypto gold rush era, {MANGA_STYLE}"),
    ("s05b-bubble", "03", f"SNS bubble wave with social media icons, growing wave size, Instagram and YouTube era, {MANGA_STYLE}"),
    ("s05b-bubble", "04", f"All three past bubbles shown as small waves compared to MASSIVE AI tsunami wave towering above them all, dramatic scale comparison, {MANGA_STYLE}"),
    ("s05b-bubble", "05", f"Person riding the golden crest of AI wave triumphantly, early adopter success, billions in hand, surfing the wave, {MANGA_STYLE}"),
    ("s05b-bubble", "06", f"Confident declaration '過去のどのバブルとも別物' (Unlike any past bubble), scale comparison chart, new era proclamation, {MANGA_STYLE}"),
    ("s05b-bubble", "07", f"Marketing textbooks and skills crumbling and dissolving, 'マーケティングが不要になる' revolution, old ways disappearing, {MANGA_STYLE}"),
    ("s05b-bubble", "08", f"Millions of yen worth of learned skills becoming worthless, skill certificates fading, dramatic devaluation, {MANGA_STYLE}"),
    ("s05b-bubble", "09", f"Massive gap between wave riders at top and those left behind at bottom, '差は計り知れません' (Immeasurable gap), dramatic separation, {MANGA_STYLE}"),

    # ==========================================
    # s06b-revolution: マーケティング不要革命 (20秒 → 7枚)
    # ==========================================
    ("s06b-revolution", "01", f"Business person leveling up with AI boost arrows, 'さらに上を目指せる' (Aim even higher), growth acceleration, {MANGA_STYLE}"),
    ("s06b-revolution", "02", f"Startup entrepreneur launching with AI rocket boost, '一気に加速' (Accelerate at once), rapid launch visualization, {MANGA_STYLE}"),
    ("s06b-revolution", "03", f"Side hustle worker delegating everything to AI agents, relaxed while AI works, 'AIに自動で任せる' automation, {MANGA_STYLE}"),
    ("s06b-revolution", "04", f"AI tentacles reaching into every industry sector, healthcare education retail manufacturing, 全ジャンル浸透 (all sectors penetrated), {MANGA_STYLE}"),
    ("s06b-revolution", "05", f"Freelance designer and video editor and writer watching their jobs being replaced by AI robots, concerned expressions, job displacement, {MANGA_STYLE}"),
    ("s06b-revolution", "06", f"Skills and expertise being absorbed and replicated by AI, skill transfer visualization, dramatic replacement scene, {MANGA_STYLE}"),
    ("s06b-revolution", "07", f"Split dramatic scene: LEFT side dark with '脅威' (threat) and RIGHT side golden with '最大のチャンス' (greatest opportunity), bold contrast, {MANGA_STYLE}"),

    # ==========================================
    # s07b-05percent: 世界0.5%の先行者 (18秒 → 6枚)
    # ==========================================
    ("s07b-05percent", "01", f"Tiny 0.5 percent illuminated group vs 99.5 percent in darkness, elite awareness visualization, '世界でわずか0.5パーセント', {MANGA_STYLE}"),
    ("s07b-05percent", "02", f"Finger pointing at viewer 'あなたは先行者の資格を持っている' (You have the qualification), empowering moment, golden highlight, {MANGA_STYLE}"),
    ("s07b-05percent", "03", f"Exponential 1000x growth curve in 1 year, dramatic acceleration visualization, numbers multiplying rapidly, {MANGA_STYLE}"),
    ("s07b-05percent", "04", f"Calendar showing 1 year from now with 'もう同じチャンスはない' (No more same chance), door closing, last opportunity, {MANGA_STYLE}"),
    ("s07b-05percent", "05", f"Airplane on runway accelerating for takeoff, '離陸前の最後の直線' (Final straight before takeoff), speed lines, engines blazing, {MANGA_STYLE}"),
    ("s07b-05percent", "06", f"Critical moment of acceleration or staying grounded forever, '永遠に飛び立てない' if you miss this, dramatic now-or-never, {MANGA_STYLE}"),

    # ==========================================
    # s08b-stillintime: 今なら、まだ間に合う (17秒 → 6枚)
    # ==========================================
    ("s08b-stillintime", "01", f"Ray of hope breaking through dark clouds, 'まだチャンスがあります' (You still have a chance), golden light piercing darkness, {MANGA_STYLE}"),
    ("s08b-stillintime", "02", f"Limited 30 seats with countdown timer, '先着30名限定' urgency, premium seminar hall, seats glowing, {MANGA_STYLE}"),
    ("s08b-stillintime", "03", f"10-million-yen system being unveiled, complete revelation moment, audience gasping, grand presentation, {MANGA_STYLE}"),
    ("s08b-stillintime", "04", f"FREE badge and Zoom interface, '参加費は無料・オンライン' accessibility, no barriers, {MANGA_STYLE}"),
    ("s08b-stillintime", "05", f"Seats rapidly filling with countdown, urgency increasing, last spots remaining, people rushing to register, {MANGA_STYLE}"),
    ("s08b-stillintime", "06", f"Person taking decisive action NOW, '今すぐ行動' strong determination, hand reaching out to grab opportunity, {MANGA_STYLE}"),

    # ==========================================
    # s04c-pocket: なぜ四次元ポケットなのか (24秒 → 8枚)
    # ==========================================
    ("s04c-pocket", "01", f"Magical glowing pocket opening like Doraemon's, '四次元ポケット' title reveal, wonder and mystery, blue cosmic energy, {MANGA_STYLE}"),
    ("s04c-pocket", "02", f"95 percent capability meter filling up, 'パソコンでできることの95パーセント' holographic display, impressive coverage, {MANGA_STYLE}"),
    ("s04c-pocket", "03", f"Person casually speaking to computer, ideas forming as speech bubbles, desires materializing into reality, natural interaction, {MANGA_STYLE}"),
    ("s04c-pocket", "04", f"No skill no talent required badge, equal access for everyone, '能力もスキルも才能も一切問わず' democratization of technology, {MANGA_STYLE}"),
    ("s04c-pocket", "05", f"Website system being created on the spot, code materializing from voice command, 'その場で完成' instant creation, {MANGA_STYLE}"),
    ("s04c-pocket", "06", f"Business workflow being optimized instantly, chaotic processes becoming streamlined, '即日で実現' same-day results, {MANGA_STYLE}"),
    ("s04c-pocket", "07", f"Complete sales automation pipeline, from customer acquisition to sales to delivery, 'すべてAIが代行' full automation, {MANGA_STYLE}"),
    ("s04c-pocket", "08", f"Grand reveal of realistic fourth-dimensional pocket concept, all capabilities orbiting around central portal, '現実的な四次元ポケット', {MANGA_STYLE}"),

    # ==========================================
    # s05c-evolution: 無限に進化するシステム (22秒 → 8枚)
    # ==========================================
    ("s05c-evolution", "01", f"1000x multiplier every year visualization, exponential growth curve shooting upward, '1年で1000倍' dramatic scaling, {MANGA_STYLE}"),
    ("s05c-evolution", "02", f"8-year timeline reaching 10000x, astronomical capability growth, matching business leader prediction perfectly, {MANGA_STYLE}"),
    ("s05c-evolution", "03", f"Infinite evolution spiral ascending through dimensions, system continuously upgrading itself, '無限に進化し続ける' perpetual growth, {MANGA_STYLE}"),
    ("s05c-evolution", "04", f"Yesterday impossible task becoming today's easy accomplishment, transformation from red X to green checkmark, capability expansion, {MANGA_STYLE}"),
    ("s05c-evolution", "05", f"Stressed esthetician forced to post on Instagram instead of doing actual beauty work, '本末転倒' (putting cart before horse), frustration, {MANGA_STYLE}"),
    ("s05c-evolution", "06", f"Exhausted coach spending all energy on LP creation instead of coaching, burnout from non-core tasks, wasted effort, {MANGA_STYLE}"),
    ("s05c-evolution", "07", f"Chains of unnecessary tasks breaking apart, person being liberated from marketing burden, freedom moment, wings spreading, {MANGA_STYLE}"),
    ("s05c-evolution", "08", f"Person freed and happy doing only what they love, AI handling everything else, '解放します' liberation declaration, blissful atmosphere, {MANGA_STYLE}"),

    # ==========================================
    # s06c-seminar: セミナーで公開する内容 (25秒 → 9枚)
    # ==========================================
    ("s06c-seminar", "01", f"Grand curtain opening on seminar stage, 'すべてお見せします' (We'll show you everything), dramatic reveal moment, {MANGA_STYLE}"),
    ("s06c-seminar", "02", f"AI customer acquisition system, zero ad cost, customers flowing in automatically, '広告費ゼロで自動獲得' marketing automation, {MANGA_STYLE}"),
    ("s06c-seminar", "03", f"Kindle book publishing system, books being automatically created and revenue accumulating, passive income machine, {MANGA_STYLE}"),
    ("s06c-seminar", "04", f"Global information transformer, foreign content being automatically converted to Japanese, world knowledge accessibility, {MANGA_STYLE}"),
    ("s06c-seminar", "05", f"Short video mass production factory, dozens of videos being generated daily by AI, content assembly line, {MANGA_STYLE}"),
    ("s06c-seminar", "06", f"App being created from spoken idea alone, voice-to-app visualization, 'アイデアを話すだけでアプリ完成' instant development, {MANGA_STYLE}"),
    ("s06c-seminar", "07", f"World-class research system with AI analyzing vast data, '世界最高峰のリサーチ技術' premium intelligence, {MANGA_STYLE}"),
    ("s06c-seminar", "08", f"Writing-free marketing system, AI handling all copywriting, 'ライティング不要' no writing needed badge, {MANGA_STYLE}"),
    ("s06c-seminar", "09", f"All capabilities combined in one grand showcase, every system feature displayed together, 'そのすべてを公開' complete package, {MANGA_STYLE}"),

    # ==========================================
    # s07c-bonus: 参加特典 (20秒 → 7枚)
    # ==========================================
    ("s07c-bonus", "01", f"Treasure chest opening with golden light, '参加特典' (participation bonus) title, exciting bonus reveal, sparkle effects, {MANGA_STYLE}"),
    ("s07c-bonus", "02", f"Twenty Gemini Gem icons arranged in premium display, '特典1: Gem20個' custom AI tools, marketing and business specialized, {MANGA_STYLE}"),
    ("s07c-bonus", "03", f"Custom marketing tools being demonstrated, specialized Gem for each business need, immediate usability from seminar day, {MANGA_STYLE}"),
    ("s07c-bonus", "04", f"Golden VIP ticket with exclusive stamp, '特典2: VIP優先案内' premium access rights, limited and valuable, {MANGA_STYLE}"),
    ("s07c-bonus", "05", f"December 2025 recruitment closure sign with red CLOSED stamp, '募集完全停止' scarcity emphasis, exclusive opportunity, {MANGA_STYLE}"),
    ("s07c-bonus", "06", f"VIP priority notification being handed to seminar participant only, exclusive delivery, 'セミナー参加者だけに' limited distribution, {MANGA_STYLE}"),
    ("s07c-bonus", "07", f"Both bonuses displayed together as premium package, Gems + VIP access combined, ultimate participation reward, {MANGA_STYLE}"),

    # ==========================================
    # s08c-goevolve: 進化を取りに行く (14秒 → 5枚)
    # ==========================================
    ("s08c-goevolve", "01", f"Seminar details display: 120-180 minutes, Zoom online, clean professional information layout, {MANGA_STYLE}"),
    ("s08c-goevolve", "02", f"FREE participation prominently displayed with 30-person limit counter, '参加費無料・先着30名' urgency and value, {MANGA_STYLE}"),
    ("s08c-goevolve", "03", f"Person with hopeful expression considering the offer, '少しでも思うなら' (If you feel even slightly), gentle encouragement, {MANGA_STYLE}"),
    ("s08c-goevolve", "04", f"Guarantee badge '損することは決してありません' (You'll never lose), risk-free assurance, trust building, {MANGA_STYLE}"),
    ("s08c-goevolve", "05", f"Person reaching up to grab golden 10000x opportunity wave, '1万倍の波に乗れるチャンス' seizing the moment, triumphant reach, {MANGA_STYLE}"),

    # ==========================================
    # s10-final-cta: 今すぐLINE登録 (35秒 → 12枚)
    # ==========================================
    ("s10-final-cta", "01", f"Business leader's profound question being asked, '2つの種類の人類' cosmic division of humanity, deep philosophical moment, {MANGA_STYLE}"),
    ("s10-final-cta", "02", f"Two paths splitting dramatically in cosmic space, evolution rejecters going left into darkness, evolution seekers going right into light, {MANGA_STYLE}"),
    ("s10-final-cta", "03", f"Direct question to viewer 'あなたはどちらですか？' (Which are you?), intense eye contact, dramatic personal challenge, {MANGA_STYLE}"),
    ("s10-final-cta", "04", f"Warning quote '自ら進化を否定する人間は自らの未来を制限する' etched in stone, serious warning atmosphere, {MANGA_STYLE}"),
    ("s10-final-cta", "05", f"Emotional reflection moment, 'この言葉を聞いて何を感じましたか？' person deep in thought, introspective, {MANGA_STYLE}"),
    ("s10-final-cta", "06", f"Dismissive person closing browser tab saying 'どうせ、まだ早い', representing the wrong choice, dark fade out, {MANGA_STYLE}"),
    ("s10-final-cta", "07", f"Dramatic reminder '1年で1000倍' exponential curve with urgency, clock ticking, opportunity window shrinking, {MANGA_STYLE}"),
    ("s10-final-cta", "08", f"Calendar one year from now with door firmly closed, 'もう同じチャンスはない' missed opportunity visualization, {MANGA_STYLE}"),
    ("s10-final-cta", "09", f"Global 0.5 percent awareness stat, 'だからこそ先行者になれる' exclusive advantage right now, golden ticket moment, {MANGA_STYLE}"),
    ("s10-final-cta", "10", f"30 seats countdown with urgency pulse, seats filling rapidly, '席は埋まっていきます' rush to register, {MANGA_STYLE}"),
    ("s10-final-cta", "11", f"Massive LINE app icon glowing bright green with invitation energy, '今すぐLINE友だち追加' clear CTA, hand pressing add button, {MANGA_STYLE}"),
    ("s10-final-cta", "12", f"Warm welcome scene, 'あなたのご参加をお待ちしています' open arms invitation, golden future awaiting, hopeful ending, {MANGA_STYLE}"),
]


def generate_one_image(scene_id, index, prompt, dry_run=False, force=False):
    """NanoBanana Pro で1枚の画像を生成"""
    filename = f"{scene_id}_{index}.png" if index != "00" else f"{scene_id}.png"
    output_path = os.path.join(OUTPUT_DIR, filename)

    if os.path.exists(output_path) and not force:
        size = os.path.getsize(output_path)
        if size > 10000:  # 10KB以上なら既存として扱う
            print(f"  SKIP: {filename} (exists, {size//1024}KB)", flush=True)
            return "skip"

    if dry_run:
        print(f"  DRY-RUN: {filename}", flush=True)
        print(f"    Prompt: {prompt[:80]}...", flush=True)
        return "dry"

    print(f"  GENERATING: {filename}", flush=True)
    cmd = [
        sys.executable,
        os.path.join(NANOBANANA_DIR, "scripts", "run.py"),
        "image_generator.py",
        "--prompt", prompt,
        "--output", output_path,
        "--timeout", "180",
    ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=240,
            cwd=NANOBANANA_DIR,
        )
        if result.returncode == 0 and os.path.exists(output_path):
            size = os.path.getsize(output_path)
            print(f"  OK: {filename} ({size//1024}KB)", flush=True)
            return "ok"
        else:
            print(f"  FAIL: {filename}", flush=True)
            if result.stderr:
                print(f"    stderr: {result.stderr[:200]}", flush=True)
            return "fail"
    except subprocess.TimeoutExpired:
        print(f"  TIMEOUT: {filename}", flush=True)
        return "timeout"
    except Exception as e:
        print(f"  ERROR: {filename}: {e}", flush=True)
        return "error"


def main():
    parser = argparse.ArgumentParser(description="NanoBanana Pro batch image generator")
    parser.add_argument("--scene", help="Generate for a specific scene only")
    parser.add_argument("--start-from", help="Start from this scene ID")
    parser.add_argument("--dry-run", action="store_true", help="Preview only")
    parser.add_argument("--force", action="store_true", help="Regenerate even if file exists")
    args = parser.parse_args()

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Filter scenes if needed
    images = SCENE_IMAGES
    if args.scene:
        images = [(s, i, p) for s, i, p in images if s == args.scene]
    if args.start_from:
        start_idx = next(
            (idx for idx, (s, _, _) in enumerate(images) if s.startswith(args.start_from)),
            0
        )
        images = images[start_idx:]

    total = len(images)
    print(f"\n{'='*60}", flush=True)
    print(f"NanoBanana Pro Batch Image Generator", flush=True)
    print(f"Total images: {total}", flush=True)
    print(f"Output: {OUTPUT_DIR}", flush=True)
    print(f"{'='*60}\n", flush=True)

    stats = {"ok": 0, "skip": 0, "fail": 0, "timeout": 0, "error": 0, "dry": 0}
    current_scene = None

    for idx, (scene_id, img_idx, prompt) in enumerate(images, 1):
        if scene_id != current_scene:
            current_scene = scene_id
            print(f"\n--- Scene: {scene_id} ---", flush=True)

        print(f"[{idx}/{total}]", flush=True)
        result = generate_one_image(scene_id, img_idx, prompt, dry_run=args.dry_run, force=args.force)
        stats[result] = stats.get(result, 0) + 1

        # Wait between generations to avoid rate limiting
        if result == "ok":
            time.sleep(2)

    print(f"\n{'='*60}", flush=True)
    print(f"COMPLETE", flush=True)
    print(f"  OK: {stats['ok']}, Skip: {stats['skip']}, Fail: {stats['fail']}, "
          f"Timeout: {stats['timeout']}, Error: {stats['error']}", flush=True)
    if args.dry_run:
        print(f"  Dry-run: {stats['dry']}", flush=True)
    print(f"{'='*60}", flush=True)


if __name__ == "__main__":
    main()
