#!/usr/bin/env python3
"""全20シーンのTTS音声を再生成（text_preprocessor統合）

text_preprocessor.pyで数字読み変換・固有名詞変換を適用してから
Fish Audio APIに送信する。

使い方:
  export FISH_AUDIO_API_KEY="your-api-key"
  python3 scripts/generate-audio.py
  python3 scripts/generate-audio.py --dry-run   # プレビューのみ
  python3 scripts/generate-audio.py --scene s01-hook  # 1シーンだけ
"""

import json
import os
import sys
import time
import urllib.request

# text_preprocessor.py をインポート
sys.path.insert(
    0,
    os.path.expanduser(
        "~/.claude/skills/interactive-video-platform/scripts"
    ),
)
from text_preprocessor import JapaneseTextPreprocessor

FISH_API_URL = "https://api.fish.audio/v1/tts"
VOICE_ID = "d4c86c697b3e4fc090cf056f17530b2a"
OUTPUT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "public",
    "audio",
    "scenes",
)

SCENES = [
    ("s01-hook", "速報です。2026年2月、ついにAIが人間の知能を完全に超えるアップデートが完了しました。こんなシステムが欲しい。そうつぶやいた瞬間に、目の前でシステムが完成する。業務の効率化も、集客から販売の自動化も、世界中からの情報リサーチも、すべてが一瞬で叶う時代がやってきました。開発費1000万円以上をかけて完成させた、すべてを叶える現実的な四次元ポケット。AI自動化とマーケティング不要革命。これからはやりたいことだけを楽しんでください。この動画でその革命の全貌をお伝えします。"),
    ("s02-son", "私の言葉は信じなくてもいい。ただ、この人の言葉だけは聞いてほしい。誰もが知る、ソフトバンクの孫正義氏。何兆円ものAI投資を行い、世界のテクノロジーの未来を動かし続けている男が、SoftBank World 2025の壇上でこう宣言しました。8年後に、AIの能力は1万倍上がる。2年後に、一人が1000のエージェントを持つ時代が来る。1万倍です。今のChatGPTやGeminiの1万倍の能力を持つAIが誕生する。そしてたった2年後には、一人が1000体のAIエージェントを従えて仕事をする。これは何兆円もの自己資金を投じている経営者の覚悟ある宣言です。"),
    ("s03-two-types", "さらに孫正義氏はこう言いました。進化を斜め上から疑って、どうせ、なんでそんなもの、そう言う人は進化を自ら否定するタイプだと思います。進化を自ら否定すると、向こうに限界があるのではなくて、自分が自分に限界を作っている。そして最後にこう締めくくりました。2つの種類の人類がいる。進化を嫌う側と進化を求める側。進化を真正面から捉えて食らいつく。それが今の日本に一番必要なことだと思います。あなたは、どちらの側ですか？"),
    ("cp1", "ここであなたに質問です。あなたが一番知りたいことはどれですか？"),
    ("s04a-practice", "正直に言います。私は特別な天才ではありません。ただ孫正義氏の言葉を素直に信じて、異常なスピードと環境で実践しただけです。3ヶ月以上、1日15時間以上を費やし、毎月300万円以上のコンサル費用を投じて知識と情報を積み上げ続けました。AI関連の高額コミュニティに複数参加し、年商50億円のマーケッターに個別コンサルを受け、大企業経営者の会で最前線の情報を入手。SNS24年の経験、プロモーション累計30億以上の実績。その全てを注ぎ込んで、開発費1000万円以上をかけて完成させたのがこのシステムです。"),
    ("s05a-ceo", "そしてこのシステムを見た瞬間、驚くべき反応が返ってきました。500億円企業の経営者がこれは欲しいと即答。入会費150万円のAIコミュニティの運営者がこんなものが存在するのかと驚愕。そして年商70億円のトップマーケッターが、これは次の10年を決める技術だと断言しました。何十億、何百億の世界で生きている人たちが、口を揃えてこのシステムの価値を認めたのです。"),
    ("s06a-beginner", "さらに驚くべきことに、このシステムを手にした完全な初心者にも信じられないことが起きています。プログラミング経験ゼロの方がたった1ヶ月で400万円のシステムを企業から受注しました。実質コスト1000円で作ったシステムを100万円で販売し、毎月5万円のサポート契約まで獲得。以前はLP制作に50万円かかっていたものが、1日でコスト1000円以下に激減。動画教材を毎日10本から30本、自動で量産できるようになりました。"),
    ("s07a-top", "年収5000万円から10億円のプレイヤーたちも口を揃えてこう言います。早くスタートできて本当に良かった。このシステムがあれば何でもできる。すでに投資した分の元は余裕で取りました。全員に共通していること。それは孫正義氏の言う通り、進化を真正面から捉えて自ら取りに行ったということです。進化を否定せず、素直に飛び込んだ人だけが、今この成果を手にしています。"),
    ("s08a-join", "あなたにも同じチャンスがあります。先着30名限定の無料セミナーで、開発費1000万円相当のシステムの全貌を公開します。所要時間120分から180分。オンラインZoom開催。参加費は無料です。進化を取りに行く決断をした方から席は埋まっていきます。あなたも先行者の仲間入りを。"),
    ("s04b-gap", "孫正義氏が言うAI能力が1万倍の世界。それは裏を返せば、今始めた人と8年後に始めた人では1万倍の差がつく世界ということです。1年後でも1000倍の差。3年後には1万倍近い差になる。どうせ、まだ早い、自分には関係ない。そう思った瞬間、あなたは自分の未来に自分で限界を作っています。孫正義氏自身がこう言っています。自ら進化を否定する人間は、自らの未来を制限するということになる。これは警告です。"),
    ("s05b-bubble", "ITバブル、暗号通貨バブル、SNSバブル。歴史を振り返れば、すべて初期に飛び込んだ人だけが億を手にしてきました。私自身、暗号通貨バブルもSNSバブルもコンテンツビジネスバブルも経験してきた人間です。だから断言できます。今回の次世代AIバブルは、過去のどのバブルとも別物です。なぜならマーケティングそのものを不要にする革命が起こるからです。何百万円もかけて学んできたスキルが不要になる。この波に乗り遅れた人と先行者との差は計り知れません。"),
    ("s06b-revolution", "今ビジネスしている人はさらに上を目指せる。起業したい人はAIで一気に加速できる。副業を探している人はAIに自動で任せればいい。業種を問わず、AIは全ジャンルに浸透していきます。フリーランスのデザイナー、動画編集者、ライター。これまでスキルで食べてきた人たちの仕事がAIに置き換わっていく。それは脅威でもあり、同時に最大のチャンスでもあります。"),
    ("s07b-05percent", "世界でこの事実に気づいているのは、わずか0.5パーセント。日本ではさらに少ない。つまり今この動画を見ているあなたは、すでに先行者の資格を持っています。AIの進化は1年で1000倍。1年後にはもう、今日と同じチャンスはありません。飛行機の滑走路にたとえるなら、今が離陸前の最後の直線。ここで加速しなければ、永遠に飛び立てない。"),
    ("s08b-stillintime", "しかし、今この動画を見ているあなたにはまだチャンスがあります。先着30名限定の無料セミナーで、1000万円相当のシステムの全貌を公開します。参加費は無料。オンラインZoom開催。進化を取りに行く決断をした方から席は埋まっていきます。1年後に後悔しないために、今すぐ行動してください。"),
    ("s04c-pocket", "なぜ四次元ポケットと呼ぶのか。パソコンでできることの95パーセントが、このシステムひとつで実現可能です。欲しいこと、やりたいこと、思いついたこと。それをパソコンに話しかけるだけ。能力もスキルも才能も一切問わず、平等に実現してくれます。サイトのシステムを作りたい、その場で完成。業務を効率化したい、即日で実現。集客から販売まで自動化したい、すべてAIが代行。だから現実的な四次元ポケットと呼んでいます。"),
    ("s05c-evolution", "しかもAIの能力は1年で1000倍。8年後には孫正義氏の言う通り1万倍に到達する。あなたが手にするのは、無限に進化し続けるシステムです。今日できなかったことが明日にはできるようになる。本業以外の悩みを持つことは本末転倒であり時間の無駄。エステサロンなのにインスタ投稿に追われる。コーチなのにLP作りに疲弊する。そんな本末転倒な世界から、あなたを解放します。"),
    ("s06c-seminar", "無料セミナーではこのシステムの中身をすべてお見せします。AI集客で広告費ゼロで見込み客を自動獲得する方法。Kindle出版で収益が積み上がるシステム。海外情報を自動で日本語コンテンツに変換する仕組み。ショート動画を毎日大量に生成するAI活用法。アイデアを話すだけでアプリが完成する生成システム。世界最高峰のリサーチ技術。ライティング不要のマーケティングAIシステム。そのすべてを公開します。"),
    ("s07c-bonus", "さらに参加特典があります。特典1、Gemini専用Gem20個を無料でプレゼント。マーケティングとビジネスに完全特化したカスタムツールGemを、セミナー当日から即座に活用できます。特典2、VIP優先案内の権利。2025年12月に募集を完全停止した先行者利益VIP枠。その優先案内を受け取る権利を、セミナー参加者だけにお届けします。"),
    ("s08c-goevolve", "所要時間120分から180分。オンラインZoom開催。参加費は無料。先着30名様限定です。進化を取りに行く側でありたいと少しでも思うなら、今回の話を聞いておいて損することは決してありません。むしろ、1万倍の波に乗れるチャンスを掴めます。"),
    ("s10-final-cta", "孫正義氏は問いかけました。2つの種類の人類がいるとしたら、進化を嫌う側と進化を求める側。あなたはどちらですか？自ら進化を否定する人間は、自らの未来を制限する。この言葉を聞いて何を感じましたか？どうせ、まだ早い。そう思って閉じるのも自由です。でもAIの進化は1年で1000倍。1年後にはもう今日と同じチャンスはありません。世界で0.5パーセントしか気づいていない今だからこそ先行者になれる。先着30名。進化を取りに行く決断をした方から席は埋まっていきます。今すぐLINE友だち追加で、次世代AI四次元ポケットシステムの先行案内を受け取ってください。あなたのご参加をお待ちしています。"),
]


def generate_audio(scene_id, text, preprocessor, api_key):
    """1シーンの音声を生成"""
    output_file = os.path.join(OUTPUT_DIR, f"{scene_id}.mp3")

    # text_preprocessor で前処理（数字読み + 固有名詞変換）
    processed = preprocessor.preprocess(text)

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    data = json.dumps({
        "text": processed,
        "reference_id": VOICE_ID,
        "format": "mp3",
    }).encode()

    req = urllib.request.Request(FISH_API_URL, data=data, headers=headers)
    with urllib.request.urlopen(req, timeout=120) as resp:
        audio_data = resp.read()

    with open(output_file, "wb") as f:
        f.write(audio_data)

    return len(audio_data)


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="全20シーンのTTS音声を再生成"
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="前処理結果のプレビューのみ（API呼び出しなし）"
    )
    parser.add_argument(
        "--scene", type=str,
        help="指定シーンのみ生成（例: s01-hook）"
    )
    args = parser.parse_args()

    api_key = os.environ.get("FISH_AUDIO_API_KEY")
    if not api_key and not args.dry_run:
        print("ERROR: FISH_AUDIO_API_KEY environment variable not set")
        print("  export FISH_AUDIO_API_KEY='your-api-key'")
        sys.exit(1)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    preprocessor = JapaneseTextPreprocessor()

    scenes = SCENES
    if args.scene:
        scenes = [(sid, txt) for sid, txt in SCENES if sid == args.scene]
        if not scenes:
            print(f"ERROR: Scene '{args.scene}' not found")
            sys.exit(1)

    total = len(scenes)
    success = 0
    fail = 0

    mode = "DRY-RUN" if args.dry_run else "GENERATE"
    print(f"=== Fish Audio TTS {mode} ({total} scenes) ===")
    print(f"Voice ID: {VOICE_ID}")
    print(f"Output: {OUTPUT_DIR}\n")

    for i, (scene_id, text) in enumerate(scenes, 1):
        print(f"[{i}/{total}] {scene_id}")
        processed = preprocessor.preprocess(text)

        if args.dry_run:
            print(f"  Original: {text[:60]}...")
            print(f"  Processed: {processed[:60]}...")
            success += 1
            continue

        try:
            size = generate_audio(scene_id, text, preprocessor, api_key)
            print(f"  OK: {size} bytes", flush=True)
            success += 1
        except Exception as e:
            print(f"  ERROR: {e}", flush=True)
            fail += 1

        # Small delay to avoid rate limiting
        if i < total:
            time.sleep(1)

    print(f"\n=== Done ===")
    print(f"Success: {success}/{total}")
    if fail > 0:
        print(f"Failed: {fail}/{total}")


if __name__ == "__main__":
    main()
