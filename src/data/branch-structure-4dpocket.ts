import type {
  BranchStructure,
  Scene,
  BranchScene,
  SceneStyle,
} from "@/types/video"

// ==========================================
// ダーク・ラグジュアリー・フューチャリスティックスタイル
// AI四次元ポケットシステム VSL
// ==========================================
const AI_IMAGE_STYLE =
  "Dark luxury futuristic Japanese style, deep navy #0A0A1E background, electric gold #FFD700 and cyan #00BFFF neon glows, holographic particle displays, dramatic cinematic god rays, corporate executive atmosphere fused with AI technology, 9:16 vertical format, photorealistic ultra detailed 4K"

const darkBase: SceneStyle = {
  background: "linear-gradient(180deg, #0A0A1E 0%, #0D1030 50%, #0A0820 100%)",
  textColor: "#ffffff",
  accentColor: "#FFD700",
  animation: "fade",
  overlay: "dark-grid",
}

const hookStyle: SceneStyle = {
  ...darkBase,
  background: "linear-gradient(180deg, #0A0A1E 0%, #0C0E2A 40%, #08081A 100%)",
  accentColor: "#FFD700",
  animation: "zoom",
}

const problemStyle: SceneStyle = {
  ...darkBase,
  background: "linear-gradient(180deg, #12050A 0%, #1A0810 40%, #0D0508 100%)",
  accentColor: "#FF4444",
  animation: "fade",
}

const solutionStyle: SceneStyle = {
  ...darkBase,
  background: "linear-gradient(180deg, #050F1A 0%, #071525 40%, #040C16 100%)",
  accentColor: "#00BFFF",
  animation: "fade",
}

const choiceStyle: SceneStyle = {
  ...darkBase,
  background: "linear-gradient(180deg, #0A0A1E 0%, #111430 50%, #08081A 100%)",
  accentColor: "#FFD700",
  animation: "zoom",
}

const proofStyle: SceneStyle = {
  ...darkBase,
  background: "linear-gradient(180deg, #050F0A 0%, #071510 40%, #040C08 100%)",
  accentColor: "#06C755",
  animation: "fade",
}

const authorityStyle: SceneStyle = {
  ...darkBase,
  background: "linear-gradient(180deg, #0F0A00 0%, #1A1200 40%, #0C0900 100%)",
  accentColor: "#FFD700",
  animation: "fade",
}

const seminarStyle: SceneStyle = {
  ...darkBase,
  background: "linear-gradient(180deg, #050518 0%, #080828 40%, #050514 100%)",
  accentColor: "#00BFFF",
  animation: "fade",
}

const bonusStyle: SceneStyle = {
  ...darkBase,
  background: "linear-gradient(180deg, #100A00 0%, #1A1200 30%, #100A00 100%)",
  accentColor: "#FFD700",
  animation: "particle",
}

const ctaStyle: SceneStyle = {
  ...darkBase,
  background: "linear-gradient(180deg, #08180A 0%, #0C2010 30%, #08180A 100%)",
  accentColor: "#06C755",
  animation: "zoom",
}

// ==========================================
// 共通導入部（3シーン）
// ==========================================
const commonIntroScenes: readonly Scene[] = [
  {
    id: "s01-hook",
    type: "intro",
    title: "ChatGPTだけでAI活用できてる？",
    narration:
      "ChatGPTやGeminiを使っている。それだけで「AI活用している」と思っていませんか？今、国内ではたった0.5パーセントだけが、AIの能力が1年で1,000倍進化していく第二次AIバブルの波のチャンスに気づき始めた。SNS24年、プロモーション累計30億以上。その男が1日15時間、開発費1,000万以上もかけ、現代版のAI四次元ポケットシステムが完成。今、年収1億〜10億のマーケッターたちが、このシステムに驚愕しています。",
    duration: 30,
    imagePrompt: `Person sitting at laptop with ChatGPT and Gemini interfaces glowing on screen, then dramatic reveal of advanced holographic AI system emerging around them, electric gold particles, deep navy atmosphere, contrast between basic tool user vs AI pioneer, ${AI_IMAGE_STYLE}`,
    imageCount: 10,
    imageInterval: 3000,
    nextSceneId: "s02-wall",
    style: hookStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "それだけで\n「AI活用」できてる？", emphasis: true, startTime: 0 },
      { text: "国内たった0.5%だけが\n気づき始めた", emphasis: true, startTime: 5 },
      { text: "SNS24年・累計30億", startTime: 11 },
      { text: "開発費1,000万以上", emphasis: true, startTime: 15 },
      { text: "AI四次元ポケット\nシステム完成", emphasis: true, startTime: 20 },
      { text: "年収1億〜10億が\n驚愕", startTime: 25 },
    ],
  },
  {
    id: "s02-wall",
    type: "problem",
    title: "マーケティングという壁が消える日",
    narration:
      "集客がわからない。LPが書けない。動画が作れない。SNSの運用に時間が取られる。セールスの仕組みが構築できない。やりたいことがあるのに、マーケティングの壁に阻まれて前に進めない。高額塾に通い、コンサルを受け、教材を買い漁り——それでもうまくいかない。その地獄のループが、今日終わります。LP、SNS、動画、リサーチ、マーケティング——すべてAIが24時間、あなたの代わりに働き続ける。",
    duration: 28,
    imagePrompt: `Frustrated entrepreneur trapped behind massive translucent wall labeled with marketing terms LP SNS video SEO, chains of expensive courses books consultants, dramatic red lighting, then golden light breaking through the wall shattering it, liberation scene, ${AI_IMAGE_STYLE}`,
    imageCount: 10,
    imageInterval: 3000,
    nextSceneId: "s03-pocket",
    style: problemStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "集客がわからない\nLPが書けない", emphasis: true, startTime: 0 },
      { text: "動画が作れない\nSNSに時間を奪われる", startTime: 5 },
      { text: "マーケティングの壁に\n阻まれて前に進めない", emphasis: true, startTime: 10 },
      { text: "高額塾も\nコンサルも\n教材も\n役に立たない", startTime: 15 },
      { text: "地獄のループが\n今日終わります", emphasis: true, startTime: 20 },
      { text: "AIが24時間\nあなたの代わりに働く", startTime: 24 },
    ],
  },
  {
    id: "s03-pocket",
    type: "solution",
    title: "なぜ「四次元ポケット」と呼ぶのか",
    narration:
      "なぜ四次元ポケットと呼ぶのか。パソコンでできることの95パーセントが、このシステムひとつで実現可能。欲しいこと、やりたいこと、思いついたこと——パソコンに話しかけるだけで、能力もスキルも年齢も一切問わず、平等に実現してくれます。しかもAIの能力は1年で1,000倍。孫正義氏が言う通り、8年後には1万倍に到達する。無限に進化し続けるシステム——現実的な四次元ポケット。",
    duration: 26,
    imagePrompt: `Magical dimensional portal opening from a laptop screen, glowing gold and cyan holographic tools and apps and websites emerging from it, person speaking to AI and watching their wishes materialize instantly, 95 percent meter glowing in corner, ${AI_IMAGE_STYLE}`,
    imageCount: 9,
    imageInterval: 3000,
    nextSceneId: "cp1",
    style: solutionStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "なぜ「四次元ポケット」\nと呼ぶのか", emphasis: true, startTime: 0 },
      { text: "パソコンの95%が\nひとつで実現可能", emphasis: true, startTime: 5 },
      { text: "話しかけるだけで\n平等に実現", startTime: 11 },
      { text: "AIの能力は\n1年で1,000倍", emphasis: true, startTime: 16 },
      { text: "8年後には1万倍", startTime: 20 },
      { text: "無限に進化する\n四次元ポケット", emphasis: true, startTime: 23 },
    ],
  },
] as const

// ==========================================
// 選択ポイント
// ==========================================
const choicePoint1: BranchScene = {
  id: "cp1",
  type: "choice",
  title: "あなたが今最も感じているマーケティングの壁は？",
  narration:
    "ここであなたに質問です。今、あなたが最も感じているマーケティングの壁はどれですか？",
  duration: 4,
  imagePrompt: `Three glowing portal doors in dark space, left door gold with megaphone icon, center door cyan with video camera icon, right door emerald with circuit board AI icon, choice moment atmosphere, dramatic lighting, ${AI_IMAGE_STYLE}`,
  imageCount: 3,
  imageInterval: 2000,
  nextSceneId: null,
  style: choiceStyle,
  mediaType: "image",
  keyPhrases: [
    { text: "あなたが今最も感じている\nマーケティングの壁は？", emphasis: true, startTime: 0 },
  ],
  choicePoint: {
    id: "cp1",
    question: "あなたが今最も感じているマーケティングの壁は？",
    options: [
      {
        id: "cp1_a",
        label: "集客・LP・SNSから解放されたい",
        description: "マーケティング業務をまるごとAIに任せたい",
        nextSceneId: "s04a-marketing",
        icon: "megaphone",
      },
      {
        id: "cp1_b",
        label: "動画・コンテンツ制作を自動化したい",
        description: "ショート動画・Kindle・海外コンテンツを量産したい",
        nextSceneId: "s04b-content",
        icon: "video",
      },
      {
        id: "cp1_c",
        label: "ビジネス全体を全自動化したい",
        description: "開発費1,000万のシステムの全貌を知りたい",
        nextSceneId: "s04c-authority",
        icon: "sparkles",
      },
    ],
    timeoutSeconds: 15,
    defaultOptionIndex: 0,
  },
}

// ==========================================
// 分岐A: 集客・マーケティング解放ルート
// ==========================================
const branchAScenes: readonly Scene[] = [
  {
    id: "s04a-marketing",
    type: "solution",
    title: "AIが集客・LP・SNSを完全代行",
    narration:
      "AIがあなたの代わりに集客とマーケティングを完全自動化します。LP制作費50万円？AIなら1日でコスト1,000円以下。SNS投稿はネタ作成から投稿まで完全自動。集客から販売まで一気通貫で自動化。ライティング不要——年商10億マーケッターも唸るAIマーケティングシステム。AI集客で広告費ゼロで見込み客を自動獲得する最新手法が、すべて手に入ります。",
    duration: 27,
    imagePrompt: `Gold robot AI creating LP pages and social media posts simultaneously on multiple holographic screens, conveyor belt of perfect content being produced automatically, LP creation cost comparison 500000 yen shrinking to 1000 yen in glowing display, marketer relaxing while AI works, ${AI_IMAGE_STYLE}`,
    imageCount: 10,
    imageInterval: 3000,
    nextSceneId: "s05a-results",
    style: solutionStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "集客・LP・SNSを\n完全代行", emphasis: true, startTime: 0 },
      { text: "LP制作費50万円が\n1日・1,000円以下", emphasis: true, startTime: 5 },
      { text: "SNS完全自動化", startTime: 10 },
      { text: "集客から販売まで\n一気通貫自動化", startTime: 14 },
      { text: "ライティング不要", emphasis: true, startTime: 19 },
      { text: "広告費ゼロで\n見込み客を自動獲得", emphasis: true, startTime: 23 },
    ],
  },
  {
    id: "s05a-results",
    type: "proof",
    title: "進化を取りに行った人たちの現実",
    narration:
      "このシステムを先行で手にした人たちに、信じられないことが起きています。完全な初心者が、1ヶ月で400万円のシステムを企業から受注。実質コスト1,000円で作ったシステムを100万円で販売。年収5,000万〜10億円のプレイヤーたちも口を揃えます。早くスタートできて良かった。このシステムで何でもできる。すでに元は余裕で取りました——と。0.5パーセントの側にいる人たちは、もうここまで来ています。",
    duration: 22,
    imagePrompt: `Success stories visualization, before and after transformation, beginner person receiving 4 million yen contract document, system being sold for 1 million yen, testimonials as glowing floating cards in gold, elite 0.5 percent circle glowing in darkness, ${AI_IMAGE_STYLE}`,
    imageCount: 8,
    imageInterval: 3000,
    nextSceneId: "s06a-cta",
    style: proofStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "完全な初心者が\n1ヶ月で400万受注", emphasis: true, startTime: 0 },
      { text: "コスト1,000円→\n100万円で販売", emphasis: true, startTime: 5 },
      { text: "年収10億が\n「元は取った」", startTime: 11 },
      { text: "0.5%の側へ", emphasis: true, startTime: 16 },
    ],
  },
  {
    id: "s06a-cta",
    type: "cta",
    title: "マーケティング解放の全貌を無料公開",
    narration:
      "無料セミナーでは、AIマーケティング完全自動化の仕組みをすべて公開します。広告費ゼロで見込み客を自動獲得する最新手法。ライティング不要で年商10億マーケッターも唸るシステム。UTAGEやLステップに毎月お金を払う時代が終わる理由まで。120分から180分で、すべてをお見せします。先着100名様限定。参加費は完全無料です。",
    duration: 20,
    imagePrompt: `Free seminar invitation scene, golden ticket glowing in dark space, 100 seats countdown display, marketing automation icons floating around, zero advertising cost symbol, UTAGE and LINE tools crossing out icon replaced by AI system, urgency atmosphere, ${AI_IMAGE_STYLE}`,
    imageCount: 7,
    imageInterval: 3000,
    nextSceneId: "s07-seminar",
    style: ctaStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "完全自動化の仕組み\nすべて公開", emphasis: true, startTime: 0 },
      { text: "広告費ゼロで\n自動集客", startTime: 5 },
      { text: "月額ツール不要の\n時代が来た", startTime: 10 },
      { text: "先着100名限定", emphasis: true, startTime: 15 },
      { text: "参加費は完全無料", emphasis: true, startTime: 17 },
    ],
  },
] as const

// ==========================================
// 分岐B: コンテンツ・動画自動化ルート
// ==========================================
const branchBScenes: readonly Scene[] = [
  {
    id: "s04b-content",
    type: "solution",
    title: "動画・コンテンツを毎日自動量産",
    narration:
      "ショート動画を毎日大量生成するAI活用の全貌をお見せします。動画教材を毎日10本〜30本、自動量産。Kindle複利無限出版——出すほど資産が積み上がるシステム。海外情報を日本語コンテンツに自動変換し収益化する仕組み。まだ日本には届いていない最先端の動画マーケティング。あなたは話すだけ。あとはAIが全部作り上げます。",
    duration: 26,
    imagePrompt: `Factory of content creation, AI generating short videos automatically on assembly line, Kindle books stacking up as assets, foreign content being translated and converted to Japanese automatically, video thumbnails multiplying in holographic display, 10 to 30 videos per day counter, ${AI_IMAGE_STYLE}`,
    imageCount: 9,
    imageInterval: 3000,
    nextSceneId: "s05b-results",
    style: solutionStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "動画を毎日\n10〜30本自動量産", emphasis: true, startTime: 0 },
      { text: "Kindle複利\n無限出版", emphasis: true, startTime: 5 },
      { text: "海外情報を\n日本語で収益化", startTime: 10 },
      { text: "最先端の\n動画マーケティング", startTime: 15 },
      { text: "話すだけで\nAIが全部作る", emphasis: true, startTime: 20 },
    ],
  },
  {
    id: "s05b-results",
    type: "proof",
    title: "コンテンツで資産を積み上げた現実",
    narration:
      "このシステムを先行で手にした人たちに、驚異的なことが起きています。実質コスト1,000円で作ったシステムを100万円で販売。毎月5万円のサポート契約を継続的に獲得。動画教材は毎日自動量産で資産が積み上がり続ける。Kindleは出すたびに複利で収益が増える。コンテンツが資産になる仕組みを、すでに手にした人たちが動き始めています。",
    duration: 22,
    imagePrompt: `Content becoming assets visualization, Kindle books stacking as revenue graph rises, monthly recurring 50000 yen contracts multiplying, 1000 yen cost turning into 1 million yen sale transformation in glowing display, compound interest chart rising, ${AI_IMAGE_STYLE}`,
    imageCount: 8,
    imageInterval: 3000,
    nextSceneId: "s06b-cta",
    style: proofStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "コスト1,000円が\n100万円に化けた", emphasis: true, startTime: 0 },
      { text: "毎月5万円の\n継続契約", emphasis: true, startTime: 5 },
      { text: "コンテンツが\n資産になる", startTime: 11 },
      { text: "複利で積み上がる\n仕組み", emphasis: true, startTime: 16 },
    ],
  },
  {
    id: "s06b-cta",
    type: "cta",
    title: "コンテンツ量産の全貌を無料公開",
    narration:
      "無料セミナーでは、コンテンツ自動量産の全仕組みをすべて公開します。ショート動画を毎日大量生成するAI革命。Kindle複利無限出版システム。海外コンテンツを収益化する仕組み。一般には出回っていないKindle裏出版メソッド。120分から180分で、すべてをお見せします。先着100名様限定。参加費は完全無料です。",
    duration: 20,
    imagePrompt: `Free seminar golden invitation, content factory visualization with videos and Kindle books and revenue streams, secret Kindle publishing method document glowing, 100 seats counter, urgency and exclusivity atmosphere, ${AI_IMAGE_STYLE}`,
    imageCount: 7,
    imageInterval: 3000,
    nextSceneId: "s07-seminar",
    style: ctaStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "コンテンツ量産の\n全仕組みを公開", emphasis: true, startTime: 0 },
      { text: "Kindle裏出版\nメソッド", startTime: 5 },
      { text: "海外コンテンツ\n収益化", startTime: 10 },
      { text: "先着100名限定", emphasis: true, startTime: 15 },
      { text: "参加費は完全無料", emphasis: true, startTime: 17 },
    ],
  },
] as const

// ==========================================
// 分岐C: 全自動マルチエージェントシステムルート
// ==========================================
const branchCScenes: readonly Scene[] = [
  {
    id: "s04c-authority",
    type: "product",
    title: "8年間、姿を消していた男の最終兵器",
    narration:
      "私は8年間、表舞台から消えていました。その間に実行していたのが、天才マーケッターだけが知るブラックオーシャン戦略です。情報を一切出さず、誰にも悟られないまま、暗闘の海底で圧倒的な武器を作り上げる。3ヶ月以上、1日15時間以上。毎月300万円以上のコンサル費用。開発費1,000万円以上。年商50億のマーケッターに個別コンサル。大企業経営者の会で最前線の情報を入手。その全てを武器に完成させたのが、500億円企業の経営者が「これは欲しい」と即答した、究極のマルチエージェントシステムです。",
    duration: 32,
    imagePrompt: `Lone strategist in dark war room with multiple monitors showing market data and AI systems, submarine surfacing from dark ocean metaphor, 8 years timeline visualization, investment figures 3 million yen monthly consulting and 10 million yen development glowing in displays, 50 billion yen CEO amazed face reaction, ${AI_IMAGE_STYLE}`,
    imageCount: 11,
    imageInterval: 3000,
    nextSceneId: "s05c-system",
    style: authorityStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "8年間\n表舞台から消えた", emphasis: true, startTime: 0 },
      { text: "ブラックオーシャン戦略", emphasis: true, startTime: 5 },
      { text: "1日15時間以上\n3ヶ月以上", startTime: 10 },
      { text: "毎月300万コンサル\n開発費1,000万", emphasis: true, startTime: 15 },
      { text: "年商50億に\n個別コンサル", startTime: 21 },
      { text: "500億企業が\n「これは欲しい」", emphasis: true, startTime: 26 },
    ],
  },
  {
    id: "s05c-system",
    type: "proof",
    title: "2つの種類の人類——孫正義",
    narration:
      "ソフトバンクの孫正義氏が、SoftBank World 2025の壇上でこう言いました。2つの種類の人類がいるとしたら、進化を嫌う側と、進化を求める側。進化を真正面から捉えて、食らいついて、進化を自ら取りに参加をする。それが今の日本に一番必要なことだと思います。世界で2パーセント、日本ではたった0.5パーセントの人だけがすでに次のステージに移行している。AIの進化は1年で1,000倍。たった1年の遅れが、1,000倍の格差を生みます。",
    duration: 28,
    imagePrompt: `Masayoshi Son silhouette at stage presenting with dramatic lighting, globe split into 0.5 percent glowing gold and 99.5 percent in shadow, two paths diverging gold and gray, evolution vs stagnation visualization, 1000x AI acceleration graph, Japanese corporate audience in awe, ${AI_IMAGE_STYLE}`,
    imageCount: 10,
    imageInterval: 3000,
    nextSceneId: "s06c-cta",
    style: authorityStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "孫正義：\n2つの種類の人類がいる", emphasis: true, startTime: 0 },
      { text: "進化を求める側と\n嫌う側", emphasis: true, startTime: 5 },
      { text: "世界2%・日本0.5%が\n次のステージへ", emphasis: true, startTime: 11 },
      { text: "1年の遅れが\n1,000倍の格差", emphasis: true, startTime: 18 },
      { text: "進化を求める側へ", emphasis: true, startTime: 24 },
    ],
  },
  {
    id: "s06c-cta",
    type: "cta",
    title: "マルチエージェントシステムの全貌を無料公開",
    narration:
      "無料セミナーでは、開発費1,000万円相当のマルチエージェントシステムの全貌をすべて公開します。欲しい、思いつき、アイデアがそのまま形になる仕組み。アイデアを話すだけでアプリが完成する無限生成システム。素人でも才能ゼロでもできる、コピペ式システム開発の手法。AI同士が自律的に動き、新しいSNS運用を切り開く世界。120分から180分で、すべてをお見せします。先着100名様限定。参加費は完全無料です。",
    duration: 22,
    imagePrompt: `Multi-agent AI system visualization showing multiple AI robots working together autonomously, idea to app in seconds demonstration, copy paste method simplicity vs complex result, 10 million yen development represented in golden blueprint, 100 seats golden invitation card, ${AI_IMAGE_STYLE}`,
    imageCount: 8,
    imageInterval: 3000,
    nextSceneId: "s07-seminar",
    style: ctaStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "マルチエージェントの\n全貌を公開", emphasis: true, startTime: 0 },
      { text: "話すだけで\nアプリ完成", startTime: 5 },
      { text: "コピペ式\nシステム開発", startTime: 10 },
      { text: "AI同士が\n自律的に動く", startTime: 14 },
      { text: "先着100名限定", emphasis: true, startTime: 17 },
      { text: "参加費は完全無料", emphasis: true, startTime: 19 },
    ],
  },
] as const

// ==========================================
// 共通後半（4シーン）
// ==========================================
const commonEndScenes: readonly Scene[] = [
  {
    id: "s07-seminar",
    type: "benefit",
    title: "無料セミナー全貌公開（120〜180分）",
    narration:
      "1,000万円をかけて完成させたシステムの中身を、すべてお見せします。AI集客——広告費ゼロで見込み客を自動獲得する最新手法。Kindle複利無限出版システム。海外情報を日本語コンテンツに自動変換して収益化する仕組み。一般には出回っていないKindle裏出版メソッド。ショート動画を毎日大量生成するAI活用の全貌。高額サイト分析ツールと同等の仕組みを自分で作る方法。アイデアを話すだけでアプリが完成する無限生成システム。UTAGEやLステップに毎月お金を払う時代が終わる理由。まだ日本には届いていない最先端の動画マーケティング。AI同士が自律的に動く次世代SNS運用。世界最高峰のリサーチ技術。ライティング不要のAIマーケティングシステム。そしてマルチエージェントシステムの全貌。素人でもできるコピペ式システム開発の手法まで——すべて公開します。",
    duration: 40,
    imagePrompt: `Grand seminar showcase hall with 14 glowing feature cards arranged in elegant display, each card showing different capability: AI recruitment, Kindle publishing, short video generation, app creation, SNS automation, research system, marketing AI, multi-agent system, gold and cyan themed, exclusive knowledge revelation atmosphere, ${AI_IMAGE_STYLE}`,
    imageCount: 13,
    imageInterval: 3000,
    nextSceneId: "s08-tokuten",
    style: seminarStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "1,000万円のシステムの\n中身をすべて公開", emphasis: true, startTime: 0 },
      { text: "AI集客\n広告費ゼロ", startTime: 5 },
      { text: "Kindle複利\n無限出版", startTime: 10 },
      { text: "ショート動画\n毎日大量生成", startTime: 15 },
      { text: "話すだけで\nアプリ完成", startTime: 20 },
      { text: "UTAGE・Lステップ\n不要の時代", startTime: 25 },
      { text: "世界最高峰の\nリサーチ技術", startTime: 30 },
      { text: "マルチエージェント\nの全貌まで", emphasis: true, startTime: 35 },
    ],
  },
  {
    id: "s08-tokuten",
    type: "benefit",
    title: "参加特典",
    narration:
      "さらに参加特典があります。特典1。Gemini専用Gem20個を無料でプレゼント。マーケティングとビジネスに完全特化したGeminiカスタムツールGemを20個、すべて無料でお渡しします。セミナー当日から即座に活用できます。特典2。VIP優先案内の権利。2025年12月に募集を完全停止した先行者利益VIP枠——その優先案内を受け取る権利を、セミナー参加者だけに限定でお届けします。",
    duration: 26,
    imagePrompt: `Luxury treasure reveal scene, golden chest opening with 20 Gemini gem tools spilling out in colorful glow, VIP platinum ticket floating above with exclusive seal, gift boxes with gold ribbon, sparkle and particle effects everywhere, premium exclusive atmosphere, ${AI_IMAGE_STYLE}`,
    imageCount: 9,
    imageInterval: 3000,
    nextSceneId: "s09-gaiyo",
    style: bonusStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "参加特典", emphasis: true, startTime: 0 },
      { text: "Gemini専用Gem\n20個を無料プレゼント", emphasis: true, startTime: 4 },
      { text: "即日から使える\n即戦力ツール", startTime: 11 },
      { text: "VIP優先案内\nの権利", emphasis: true, startTime: 16 },
      { text: "参加者だけの\n限定特典", emphasis: true, startTime: 21 },
    ],
  },
  {
    id: "s09-gaiyo",
    type: "benefit",
    title: "セミナー概要",
    narration:
      "セミナー概要です。所要時間は約120分から180分。質疑応答あり。形式はオンライン、Zoomで行います。参加費は完全無料。定員は先着100名様限定です。",
    duration: 14,
    imagePrompt: `Clean information cards layout in dark space, clock showing 120 to 180 minutes with gold glow, Zoom logo on laptop screen, FREE stamp in gold, 100 seats counter with urgency, organized premium presentation style, ${AI_IMAGE_STYLE}`,
    imageCount: 5,
    imageInterval: 3000,
    nextSceneId: "s10-final-cta",
    style: seminarStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "120〜180分", startTime: 0 },
      { text: "オンライン Zoom", startTime: 4 },
      { text: "参加費は完全無料", emphasis: true, startTime: 7 },
      { text: "先着100名様限定", emphasis: true, startTime: 10 },
    ],
  },
  {
    id: "s10-final-cta",
    type: "cta",
    title: "進化を求める側として——今すぐ参加",
    narration:
      "高額塾でマーケティングを学ぶ。コンサルに大金を払う。何ヶ月もかけてLPやSNSを試行錯誤する。その時間と費用のすべてが、不要になります。1,000万円以上をかけて完成させたシステム。初心者が400万円を受注し、1,000円で作ったものが100万円で売れ、年収10億円のプレイヤーが「何でもできる」と言った。あなたは本業だけに集中してください。マーケティングという壁は、もう存在しません。先着100名。進化を求める側として——あなたのご参加をお待ちしています。",
    duration: 28,
    imagePrompt: `Emotional climax scene, person standing on top of mountain of achievements looking toward bright gold and cyan future horizon, LINE green glowing button in foreground, 100 seats limited display with countdown urgency, freedom and evolution symbolism, welcoming light breaking through darkness, ${AI_IMAGE_STYLE}`,
    imageCount: 10,
    imageInterval: 3000,
    nextSceneId: null,
    style: ctaStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "高額塾も\nコンサルも不要", emphasis: true, startTime: 0 },
      { text: "初心者が400万受注\n1,000円が100万に", startTime: 5 },
      { text: "本業だけに\n集中してください", emphasis: true, startTime: 12 },
      { text: "マーケティングの壁は\nもう存在しない", emphasis: true, startTime: 17 },
      { text: "先着100名\n進化を求める側へ", emphasis: true, startTime: 22 },
    ],
  },
] as const

// ==========================================
// 完全なブランチ構造
// ==========================================
export const branchStructure: BranchStructure = {
  config: {
    title: "次世代AI四次元ポケットシステム - 無料セミナー先行案内",
    pattern: "06-tech-futuristic",
    format: "9:16",
    resolution: { width: 1080, height: 1920 },
    fps: 30,
    tts: {
      engine: "fish-audio",
      voiceId: "db0c899b062a430e8834aac36f30fcbd",
      language: "ja",
      speed: 1.0,
      pitch: 1.0,
    },
    totalScenes: 17,
    maxPaths: 3,
  },
  scenes: [
    ...commonIntroScenes,
    ...branchAScenes,
    ...branchBScenes,
    ...branchCScenes,
    ...commonEndScenes,
  ],
  branchScenes: [choicePoint1],
  sceneGraph: {
    entrySceneId: "s01-hook",
    nodes: {
      // 共通導入部
      "s01-hook": { sceneId: "s01-hook", next: "s02-wall" },
      "s02-wall": { sceneId: "s02-wall", next: "s03-pocket" },
      "s03-pocket": { sceneId: "s03-pocket", next: "cp1" },
      // 選択ポイント
      cp1: {
        sceneId: "cp1",
        next: null,
        choices: ["s04a-marketing", "s04b-content", "s04c-authority"],
      },
      // 分岐A: 集客・マーケティング解放ルート
      "s04a-marketing": { sceneId: "s04a-marketing", next: "s05a-results" },
      "s05a-results": { sceneId: "s05a-results", next: "s06a-cta" },
      "s06a-cta": { sceneId: "s06a-cta", next: "s07-seminar" },
      // 分岐B: コンテンツ・動画自動化ルート
      "s04b-content": { sceneId: "s04b-content", next: "s05b-results" },
      "s05b-results": { sceneId: "s05b-results", next: "s06b-cta" },
      "s06b-cta": { sceneId: "s06b-cta", next: "s07-seminar" },
      // 分岐C: 全自動マルチエージェントルート
      "s04c-authority": { sceneId: "s04c-authority", next: "s05c-system" },
      "s05c-system": { sceneId: "s05c-system", next: "s06c-cta" },
      "s06c-cta": { sceneId: "s06c-cta", next: "s07-seminar" },
      // 共通後半
      "s07-seminar": { sceneId: "s07-seminar", next: "s08-tokuten" },
      "s08-tokuten": { sceneId: "s08-tokuten", next: "s09-gaiyo" },
      "s09-gaiyo": { sceneId: "s09-gaiyo", next: "s10-final-cta" },
      "s10-final-cta": { sceneId: "s10-final-cta", next: null },
    },
  },
}

export function getSceneById(id: string): Scene | BranchScene | undefined {
  const scene = branchStructure.scenes.find((s) => s.id === id)
  if (scene) return scene
  return branchStructure.branchScenes.find((s) => s.id === id)
}

export function getNextScene(
  currentId: string,
  choiceId?: string
): Scene | BranchScene | undefined {
  const node = branchStructure.sceneGraph.nodes[currentId]
  if (!node) return undefined

  if (node.choices && choiceId) {
    const choiceIndex = node.choices.indexOf(choiceId)
    if (choiceIndex >= 0) {
      return getSceneById(node.choices[choiceIndex])
    }
  }

  if (node.next) {
    return getSceneById(node.next)
  }

  return undefined
}

export function calculatePathDuration(sceneIds: readonly string[]): number {
  return sceneIds.reduce((total, id) => {
    const scene = getSceneById(id)
    return total + (scene?.duration ?? 0)
  }, 0)
}

export function getAllPossiblePaths(): readonly string[][] {
  const paths: string[][] = []

  function traverse(currentId: string, path: string[]): void {
    const currentPath = [...path, currentId]
    const node = branchStructure.sceneGraph.nodes[currentId]

    if (!node) return

    if (!node.next && !node.choices) {
      paths.push(currentPath)
      return
    }

    if (node.choices) {
      for (const choiceTarget of node.choices) {
        traverse(choiceTarget, currentPath)
      }
    } else if (node.next) {
      traverse(node.next, currentPath)
    }
  }

  traverse(branchStructure.sceneGraph.entrySceneId, [])
  return paths
}
