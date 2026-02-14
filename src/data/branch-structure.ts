import type {
  BranchStructure,
  Scene,
  BranchScene,
  SceneStyle,
  KeyPhrase,
} from "@/types/video"

// ==========================================
// スタイル定義（漫画風テーマ）
// ==========================================
const mangaBaseStyle: SceneStyle = {
  background: "linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 50%, #0d0d3d 100%)",
  textColor: "#ffffff",
  accentColor: "#00d4ff",
  animation: "fade",
  overlay: "manga-lines",
}

const hookStyle: SceneStyle = {
  ...mangaBaseStyle,
  background: "linear-gradient(135deg, #0d0d3d 0%, #1a1a5e 50%, #0a0a3e 100%)",
  accentColor: "#ff3333",
  animation: "glitch",
}

const sonStyle: SceneStyle = {
  ...mangaBaseStyle,
  background: "linear-gradient(135deg, #1a0a2e 0%, #2e1a4e 50%, #0d0a3d 100%)",
  accentColor: "#ffd700",
  animation: "particle",
}

const choiceStyle: SceneStyle = {
  ...mangaBaseStyle,
  background: "linear-gradient(135deg, #0a1a3e 0%, #1a2e5e 50%, #0d1d4d 100%)",
  accentColor: "#00d4ff",
  animation: "fade",
}

const proofStyle: SceneStyle = {
  ...mangaBaseStyle,
  background: "linear-gradient(135deg, #1a1a00 0%, #2e2e0a 50%, #1a1a3e 100%)",
  accentColor: "#ffd700",
  animation: "particle",
}

const fearStyle: SceneStyle = {
  ...mangaBaseStyle,
  background: "linear-gradient(135deg, #1a0000 0%, #2d0a0a 50%, #0a0a2e 100%)",
  accentColor: "#ff3366",
  animation: "glitch",
}

const systemStyle: SceneStyle = {
  ...mangaBaseStyle,
  background: "linear-gradient(135deg, #0a1a2e 0%, #1a3e4e 50%, #0d2d3d 100%)",
  accentColor: "#00ccff",
  animation: "fade",
}

const hopeStyle: SceneStyle = {
  ...mangaBaseStyle,
  background: "linear-gradient(135deg, #0a2e1a 0%, #1a4e2e 50%, #0d3d1d 100%)",
  accentColor: "#00ff88",
  animation: "particle",
}

const ctaStyle: SceneStyle = {
  ...mangaBaseStyle,
  background: "linear-gradient(135deg, #1a0a3e 0%, #2e1a5e 50%, #0a0a2e 100%)",
  accentColor: "#ffcc00",
  animation: "particle",
}

// ==========================================
// 漫画風プロンプトテンプレート
// ==========================================
const MANGA_IMAGE_STYLE =
  "dramatic Japanese manga illustration style, bold black ink outlines, cel-shading, screentone halftone textures, dynamic speed lines, high contrast shadows, vibrant saturated colors, emotional intensity, professional manga art quality"

const MANGA_VIDEO_STYLE =
  "Japanese manga animation style, bold black outlines, cel-shaded coloring, dramatic camera movement, dynamic composition, anime aesthetic, fluid motion"

// ==========================================
// 共通シーン（全パス共通：導入部）3シーン
// ==========================================
const commonScenes: readonly Scene[] = [
  {
    id: "s01-hook",
    type: "intro",
    title: "2026年、AIが人間を超えた",
    narration:
      "速報です。2026年2月、ついにAIが人間の知能を完全に超えるアップデートが完了しました。こんなシステムが欲しい。そうつぶやいた瞬間に、目の前でシステムが完成する。業務の効率化も、集客から販売の自動化も、世界中からの情報リサーチも、すべてが一瞬で叶う時代がやってきました。開発費1000万円以上をかけて完成させた、すべてを叶える現実的な四次元ポケット。AI自動化とマーケティング不要革命。これからはやりたいことだけを楽しんでください。この動画でその革命の全貌をお伝えします。",
    duration: 28,
    imagePrompt: `Breaking news flash with urgent red and white headline bursting from cracked digital screen, shockwave rippling through dark futuristic cityscape at night, ${MANGA_IMAGE_STYLE}, 9:16 vertical format`,
    imageCount: 10,
    imageInterval: 3000,
    nextSceneId: "s02-son",
    style: hookStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "速報", emphasis: true, startTime: 0 },
      { text: "AIが人間を超えた", startTime: 3 },
      { text: "つぶやくだけで\n完成する時代", startTime: 8 },
      { text: "開発費1000万円", emphasis: true, startTime: 14 },
      { text: "四次元ポケット", emphasis: true, startTime: 18 },
      { text: "マーケティング\n不要革命", startTime: 22 },
      { text: "革命の全貌を\nお伝えします", startTime: 25 },
    ],
  },
  {
    id: "s02-son",
    type: "proof",
    title: "孫正義の衝撃宣言",
    narration:
      "私の言葉は信じなくてもいい。ただ、この人の言葉だけは聞いてほしい。誰もが知る、ソフトバンクの孫正義氏。何兆円ものAI投資を行い、世界のテクノロジーの未来を動かし続けている男が、SoftBank World 2025の壇上でこう宣言しました。8年後に、AIの能力は1万倍上がる。2年後に、一人が1000のエージェントを持つ時代が来る。1万倍です。今のChatGPTやGeminiの1万倍の能力を持つAIが誕生する。そしてたった2年後には、一人が1000体のAIエージェントを従えて仕事をする。これは何兆円もの自己資金を投じている経営者の覚悟ある宣言です。",
    duration: 32,
    imagePrompt: `Grand keynote conference stage with dramatic purple and gold spotlights, powerful business leader silhouette commanding massive audience, holographic display showing glowing 10000x multiplier floating above stage, ${MANGA_IMAGE_STYLE}, 9:16 vertical format`,
    imageCount: 11,
    imageInterval: 3000,
    nextSceneId: "s03-two-types",
    style: sonStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "この人の言葉だけは\n聞いてほしい", startTime: 0 },
      { text: "孫正義氏", emphasis: true, startTime: 5 },
      { text: "AIの能力は\n1万倍上がる", emphasis: true, startTime: 12 },
      { text: "一人が1000の\nエージェントを持つ", emphasis: true, startTime: 17 },
      { text: "1万倍です", emphasis: true, startTime: 22 },
      { text: "覚悟ある宣言", emphasis: true, startTime: 28 },
    ],
  },
  {
    id: "s03-two-types",
    type: "problem",
    title: "2つの種類の人類",
    narration:
      "さらに孫正義氏はこう言いました。進化を斜め上から疑って、どうせ、なんでそんなもの、そう言う人は進化を自ら否定するタイプだと思います。進化を自ら否定すると、向こうに限界があるのではなくて、自分が自分に限界を作っている。そして最後にこう締めくくりました。2つの種類の人類がいる。進化を嫌う側と進化を求める側。進化を真正面から捉えて食らいつく。それが今の日本に一番必要なことだと思います。あなたは、どちらの側ですか？",
    duration: 25,
    imagePrompt: `Two diverging dramatic paths at crossroads, left path crumbling into darkness with heavy chains and stone barriers, right path ascending into brilliant golden AI-powered future with luminous wings and divine light, lone human silhouette standing at center facing epic life choice, ${MANGA_IMAGE_STYLE}, 9:16 vertical format`,
    imageCount: 9,
    imageInterval: 3000,
    nextSceneId: "cp1",
    style: fearStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "進化を否定する人", emphasis: true, startTime: 0 },
      { text: "自分が自分に\n限界を作っている", startTime: 5 },
      { text: "2つの種類の人類", emphasis: true, startTime: 11 },
      { text: "進化を嫌う側と\n進化を求める側", startTime: 16 },
      { text: "あなたはどちらの\n側ですか？", emphasis: true, startTime: 21 },
    ],
  },
] as const

// ==========================================
// 選択ポイント: あなたが一番知りたいことは？
// ==========================================
const choicePoint1: BranchScene = {
  id: "cp1",
  type: "choice",
  title: "あなたが一番知りたいことは？",
  narration:
    "ここであなたに質問です。あなたが一番知りたいことはどれですか？",
  duration: 4,
  imagePrompt: `Three glowing manga-style doors in dramatic corridor, left door blazing red with shield emblem, center door shining gold with trophy emblem, right door electric blue with gear emblem, intense choice moment with energy radiating from each door, ${MANGA_IMAGE_STYLE}, 9:16 vertical format`,
  imageCount: 2,
  imageInterval: 2000,
  nextSceneId: null,
  style: choiceStyle,
  mediaType: "image",
  keyPhrases: [
    { text: "あなたが一番\n知りたいことは？", emphasis: true, startTime: 0 },
  ],
  choicePoint: {
    id: "cp1",
    question: "あなたが一番知りたいことは？",
    options: [
      {
        id: "cp1_a",
        label: "実績と証拠を見たい",
        description: "誰がどんな成果を出しているのか",
        nextSceneId: "s04a-practice",
        icon: "sparkles",
      },
      {
        id: "cp1_b",
        label: "乗り遅れるリスクを知りたい",
        description: "行動しないとどうなるのか",
        nextSceneId: "s04b-gap",
        icon: "warning",
      },
      {
        id: "cp1_c",
        label: "システムの中身を知りたい",
        description: "四次元ポケットで何ができるのか",
        nextSceneId: "s04c-pocket",
        icon: "heart",
      },
    ],
    timeoutSeconds: 15,
    defaultOptionIndex: 0,
  },
}

// ==========================================
// 分岐A: 証拠・実績ルート（5シーン）
// ==========================================
const branchAScenes: readonly Scene[] = [
  {
    id: "s04a-practice",
    type: "proof",
    title: "信じて実践した結果",
    narration:
      "正直に言います。私は特別な天才ではありません。ただ孫正義氏の言葉を素直に信じて、異常なスピードと環境で実践しただけです。3ヶ月以上、1日15時間以上を費やし、毎月300万円以上のコンサル費用を投じて知識と情報を積み上げ続けました。AI関連の高額コミュニティに複数参加し、年商50億円のマーケッターに個別コンサルを受け、大企業経営者の会で最前線の情報を入手。SNS24年の経験、プロモーション累計30億以上の実績。その全てを注ぎ込んで、開発費1000万円以上をかけて完成させたのがこのシステムです。",
    duration: 33,
    imagePrompt: `Intense manga protagonist working surrounded by holographic screens and data streams, glowing investment counter showing 10 million yen, stacks of knowledge books transforming into digital code, determination and sweat drops, dramatic work montage, ${MANGA_IMAGE_STYLE}, 9:16 vertical format`,
    imageCount: 11,
    imageInterval: 3000,
    nextSceneId: "s05a-ceo",
    style: proofStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "特別な天才では\nありません", startTime: 0 },
      { text: "素直に信じて\n実践しただけ", startTime: 5 },
      { text: "1日15時間以上", emphasis: true, startTime: 11 },
      { text: "毎月300万円の\nコンサル費用", emphasis: true, startTime: 17 },
      { text: "開発費1000万円", emphasis: true, startTime: 27 },
    ],
  },
  {
    id: "s05a-ceo",
    type: "testimonial",
    title: "500億企業経営者が即答",
    narration:
      "そしてこのシステムを見た瞬間、驚くべき反応が返ってきました。500億円企業の経営者がこれは欲しいと即答。入会費150万円のAIコミュニティの運営者がこんなものが存在するのかと驚愕。そして年商70億円のトップマーケッターが、これは次の10年を決める技術だと断言しました。何十億、何百億の世界で生きている人たちが、口を揃えてこのシステムの価値を認めたのです。",
    duration: 23,
    imagePrompt: `Powerful corporate executives in dramatic manga reaction shots, speech bubbles showing amazement, 50 billion yen company CEO pointing with sparkle eyes, multiple panels showing shocked reactions, golden approval stamp effect, ${MANGA_IMAGE_STYLE}, 9:16 vertical format`,
    imageCount: 8,
    imageInterval: 3000,
    nextSceneId: "s06a-beginner",
    style: proofStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "500億円企業の\n経営者が即答", emphasis: true, startTime: 0 },
      { text: "こんなものが\n存在するのか", startTime: 6 },
      { text: "次の10年を\n決める技術", emphasis: true, startTime: 13 },
      { text: "口を揃えて\n価値を認めた", startTime: 19 },
    ],
  },
  {
    id: "s06a-beginner",
    type: "testimonial",
    title: "初心者が400万円受注",
    narration:
      "さらに驚くべきことに、このシステムを手にした完全な初心者にも信じられないことが起きています。プログラミング経験ゼロの方がたった1ヶ月で400万円のシステムを企業から受注しました。実質コスト1000円で作ったシステムを100万円で販売し、毎月5万円のサポート契約まで獲得。以前はLP制作に50万円かかっていたものが、1日でコスト1000円以下に激減。動画教材を毎日10本から30本、自動で量産できるようになりました。",
    duration: 26,
    imagePrompt: `Manga-style transformation sequence, ordinary person on left transforming into confident professional on right, floating achievement numbers 4 million yen contract, cost comparison 500000 yen crossed to 1000 yen, video icons multiplying rapidly, dramatic before-after composition, ${MANGA_IMAGE_STYLE}, 9:16 vertical format`,
    imageCount: 9,
    imageInterval: 3000,
    nextSceneId: "s07a-top",
    style: proofStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "完全な初心者が", emphasis: true, startTime: 0 },
      { text: "1ヶ月で\n400万円受注", emphasis: true, startTime: 5 },
      { text: "コスト1000円で\n100万円販売", startTime: 10 },
      { text: "LP制作50万円が\n1000円以下に", emphasis: true, startTime: 16 },
      { text: "毎日30本\n自動量産", startTime: 22 },
    ],
  },
  {
    id: "s07a-top",
    type: "testimonial",
    title: "トップマーケッターの証言",
    narration:
      "年収5000万円から10億円のプレイヤーたちも口を揃えてこう言います。早くスタートできて本当に良かった。このシステムがあれば何でもできる。すでに投資した分の元は余裕で取りました。全員に共通していること。それは孫正義氏の言う通り、進化を真正面から捉えて自ら取りに行ったということです。進化を否定せず、素直に飛び込んだ人だけが、今この成果を手にしています。",
    duration: 21,
    imagePrompt: `Elite group of successful manga characters standing together confidently, speech bubbles with testimonials, income indicators showing 50M to 1B yen, golden aura of success surrounding them, triumphant group pose with AI hologram in background, ${MANGA_IMAGE_STYLE}, 9:16 vertical format`,
    imageCount: 7,
    imageInterval: 3000,
    nextSceneId: "s08a-join",
    style: proofStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "年収5000万から\n10億円の証言", emphasis: true, startTime: 0 },
      { text: "早くスタートできて\n良かった", startTime: 5 },
      { text: "元は余裕で\n取りました", startTime: 10 },
      { text: "進化を自ら\n取りに行った", emphasis: true, startTime: 15 },
    ],
  },
  {
    id: "s08a-join",
    type: "cta",
    title: "先行者の仲間入りへ",
    narration:
      "あなたにも同じチャンスがあります。先着30名限定の無料セミナーで、開発費1000万円相当のシステムの全貌を公開します。所要時間120分から180分。オンラインZoom開催。参加費は無料です。進化を取りに行く決断をした方から席は埋まっていきます。あなたも先行者の仲間入りを。",
    duration: 17,
    imagePrompt: `Grand manga invitation scene, golden ticket or VIP pass floating toward viewer, seminar hall with 30 premium seats glowing, countdown display, Zoom interface hologram, welcoming hand reaching out, warm inviting golden light, ${MANGA_IMAGE_STYLE}, 9:16 vertical format`,
    imageCount: 6,
    imageInterval: 3000,
    nextSceneId: "s10-final-cta",
    style: ctaStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "あなたにも\n同じチャンス", emphasis: true, startTime: 0 },
      { text: "先着30名限定", emphasis: true, startTime: 4 },
      { text: "参加費は無料", startTime: 9 },
      { text: "先行者の\n仲間入りを", emphasis: true, startTime: 13 },
    ],
  },
] as const

// ==========================================
// 分岐B: 危機感・緊急性ルート（5シーン）
// ==========================================
const branchBScenes: readonly Scene[] = [
  {
    id: "s04b-gap",
    type: "fear",
    title: "1万倍の差がつく世界",
    narration:
      "孫正義氏が言うAI能力が1万倍の世界。それは裏を返せば、今始めた人と8年後に始めた人では1万倍の差がつく世界ということです。1年後でも1000倍の差。3年後には1万倍近い差になる。どうせ、まだ早い、自分には関係ない。そう思った瞬間、あなたは自分の未来に自分で限界を作っています。孫正義氏自身がこう言っています。自ら進化を否定する人間は、自らの未来を制限するということになる。これは警告です。",
    duration: 24,
    imagePrompt: `Dramatic exponential gap visualization in manga style, small figure on left being left behind as massive gap widens, giant 10000x number looming overhead, clock ticking urgently, chain breaking moment, dark ominous atmosphere with red warning effects, ${MANGA_IMAGE_STYLE}, 9:16 vertical format`,
    imageCount: 8,
    imageInterval: 3000,
    nextSceneId: "s05b-bubble",
    style: fearStyle,
    mediaType: "video",
    keyPhrases: [
      { text: "1万倍の差が\nつく世界", emphasis: true, startTime: 0 },
      { text: "1年後でも\n1000倍の差", emphasis: true, startTime: 5 },
      { text: "どうせ、まだ早い", emphasis: true, startTime: 10 },
      { text: "自分で限界を\n作っている", startTime: 15 },
      { text: "これは警告です", emphasis: true, startTime: 20 },
    ],
  },
  {
    id: "s05b-bubble",
    type: "fear",
    title: "過去のバブルの教訓",
    narration:
      "ITバブル、暗号通貨バブル、SNSバブル。歴史を振り返れば、すべて初期に飛び込んだ人だけが億を手にしてきました。私自身、暗号通貨バブルもSNSバブルもコンテンツビジネスバブルも経験してきた人間です。だから断言できます。今回の次世代AIバブルは、過去のどのバブルとも別物です。なぜならマーケティングそのものを不要にする革命が起こるからです。何百万円もかけて学んできたスキルが不要になる。この波に乗り遅れた人と先行者との差は計り知れません。",
    duration: 27,
    imagePrompt: `Historical timeline manga panel showing IT bubble, crypto bubble, SNS bubble as smaller waves, then massive AI tsunami wave towering above all, tiny people being swept away who hesitated, early surfers riding the golden wave top, dramatic wave composition, ${MANGA_IMAGE_STYLE}, 9:16 vertical format`,
    imageCount: 9,
    imageInterval: 3000,
    nextSceneId: "s06b-revolution",
    style: fearStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "ITバブル\n暗号通貨バブル", startTime: 0 },
      { text: "初期に飛び込んだ\n人だけが億を", emphasis: true, startTime: 5 },
      { text: "過去のどの\nバブルとも別物", emphasis: true, startTime: 12 },
      { text: "マーケティングが\n不要になる", emphasis: true, startTime: 18 },
      { text: "乗り遅れた人との\n差は計り知れない", startTime: 23 },
    ],
  },
  {
    id: "s06b-revolution",
    type: "fear",
    title: "マーケティング不要革命",
    narration:
      "今ビジネスしている人はさらに上を目指せる。起業したい人はAIで一気に加速できる。副業を探している人はAIに自動で任せればいい。業種を問わず、AIは全ジャンルに浸透していきます。フリーランスのデザイナー、動画編集者、ライター。これまでスキルで食べてきた人たちの仕事がAIに置き換わっていく。それは脅威でもあり、同時に最大のチャンスでもあります。",
    duration: 20,
    imagePrompt: `Split manga panel showing jobs being replaced by AI robots on one side, and people leveraging AI to multiply their output on the other, dramatic contrast between fear and opportunity, business icons transforming, intense emotional atmosphere, ${MANGA_IMAGE_STYLE}, 9:16 vertical format`,
    imageCount: 7,
    imageInterval: 3000,
    nextSceneId: "s07b-05percent",
    style: fearStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "ビジネスは\nさらに上へ", startTime: 0 },
      { text: "全ジャンルに\n浸透していく", startTime: 5 },
      { text: "スキルの仕事が\nAIに置き換わる", emphasis: true, startTime: 11 },
      { text: "脅威であり\n最大のチャンス", emphasis: true, startTime: 16 },
    ],
  },
  {
    id: "s07b-05percent",
    type: "fear",
    title: "世界0.5%の先行者",
    narration:
      "世界でこの事実に気づいているのは、わずか0.5パーセント。日本ではさらに少ない。つまり今この動画を見ているあなたは、すでに先行者の資格を持っています。AIの進化は1年で1000倍。1年後にはもう、今日と同じチャンスはありません。飛行機の滑走路にたとえるなら、今が離陸前の最後の直線。ここで加速しなければ、永遠に飛び立てない。",
    duration: 18,
    imagePrompt: `Dramatic manga runway scene, airplane accelerating on final stretch before takeoff, 0.5 percent illuminated figure standing at departure gate while 99.5 percent walk away, countdown clock ticking, intense acceleration speed lines, last chance atmosphere, ${MANGA_IMAGE_STYLE}, 9:16 vertical format`,
    imageCount: 6,
    imageInterval: 3000,
    nextSceneId: "s08b-stillintime",
    style: fearStyle,
    mediaType: "video",
    keyPhrases: [
      { text: "世界でわずか\n0.5パーセント", emphasis: true, startTime: 0 },
      { text: "あなたは先行者の\n資格を持っている", startTime: 4 },
      { text: "1年後には\n同じチャンスはない", emphasis: true, startTime: 9 },
      { text: "離陸前の\n最後の直線", emphasis: true, startTime: 14 },
    ],
  },
  {
    id: "s08b-stillintime",
    type: "solution",
    title: "今なら、まだ間に合う",
    narration:
      "しかし、今この動画を見ているあなたにはまだチャンスがあります。先着30名限定の無料セミナーで、1000万円相当のシステムの全貌を公開します。参加費は無料。オンラインZoom開催。進化を取りに行く決断をした方から席は埋まっていきます。1年後に後悔しないために、今すぐ行動してください。",
    duration: 17,
    imagePrompt: `Hope breaking through darkness in manga style, crack of golden light splitting dark sky, person stepping through portal into bright seminar hall, 30 seats with countdown, transformation from despair to determination, green and gold breakthrough energy, ${MANGA_IMAGE_STYLE}, 9:16 vertical format`,
    imageCount: 6,
    imageInterval: 3000,
    nextSceneId: "s10-final-cta",
    style: hopeStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "まだチャンスが\nあります", emphasis: true, startTime: 0 },
      { text: "先着30名限定", emphasis: true, startTime: 5 },
      { text: "参加費は無料", startTime: 9 },
      { text: "今すぐ\n行動してください", emphasis: true, startTime: 13 },
    ],
  },
] as const

// ==========================================
// 分岐C: 可能性・システムルート（5シーン）
// ==========================================
const branchCScenes: readonly Scene[] = [
  {
    id: "s04c-pocket",
    type: "product",
    title: "なぜ四次元ポケットなのか",
    narration:
      "なぜ四次元ポケットと呼ぶのか。パソコンでできることの95パーセントが、このシステムひとつで実現可能です。欲しいこと、やりたいこと、思いついたこと。それをパソコンに話しかけるだけ。能力もスキルも才能も一切問わず、平等に実現してくれます。サイトのシステムを作りたい、その場で完成。業務を効率化したい、即日で実現。集客から販売まで自動化したい、すべてAIが代行。だから現実的な四次元ポケットと呼んでいます。",
    duration: 24,
    imagePrompt: `Magical fourth-dimensional pocket opening in manga style, holographic interface emerging with multiple capability icons orbiting around it, person speaking into glowing microphone and ideas materializing as 3D objects, 95 percent capability meter, wonder and amazement expression, ${MANGA_IMAGE_STYLE}, 9:16 vertical format`,
    imageCount: 8,
    imageInterval: 3000,
    nextSceneId: "s05c-evolution",
    style: systemStyle,
    mediaType: "video",
    keyPhrases: [
      { text: "四次元ポケット", emphasis: true, startTime: 0 },
      { text: "95パーセントが\n実現可能", emphasis: true, startTime: 4 },
      { text: "話しかけるだけ", startTime: 9 },
      { text: "その場で完成", emphasis: true, startTime: 14 },
      { text: "すべてAIが代行", startTime: 19 },
    ],
  },
  {
    id: "s05c-evolution",
    type: "benefit",
    title: "無限に進化するシステム",
    narration:
      "しかもAIの能力は1年で1000倍。8年後には孫正義氏の言う通り1万倍に到達する。あなたが手にするのは、無限に進化し続けるシステムです。今日できなかったことが明日にはできるようになる。本業以外の悩みを持つことは本末転倒であり時間の無駄。エステサロンなのにインスタ投稿に追われる。コーチなのにLP作りに疲弊する。そんな本末転倒な世界から、あなたを解放します。",
    duration: 22,
    imagePrompt: `Infinite evolution spiral ascending through manga panels, system growing from seed to massive tree of capabilities, person being freed from chains of marketing tasks, esthetics salon owner happily working while AI handles social media, liberation and freedom visual, ${MANGA_IMAGE_STYLE}, 9:16 vertical format`,
    imageCount: 8,
    imageInterval: 3000,
    nextSceneId: "s06c-seminar",
    style: systemStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "1年で1000倍", emphasis: true, startTime: 0 },
      { text: "無限に進化する\nシステム", emphasis: true, startTime: 5 },
      { text: "本業以外の悩みは\n本末転倒", startTime: 11 },
      { text: "本末転倒な世界\nからの解放", emphasis: true, startTime: 17 },
    ],
  },
  {
    id: "s06c-seminar",
    type: "benefit",
    title: "セミナーで公開する内容",
    narration:
      "無料セミナーではこのシステムの中身をすべてお見せします。AI集客で広告費ゼロで見込み客を自動獲得する方法。Kindle出版で収益が積み上がるシステム。海外情報を自動で日本語コンテンツに変換する仕組み。ショート動画を毎日大量に生成するAI活用法。アイデアを話すだけでアプリが完成する生成システム。世界最高峰のリサーチ技術。ライティング不要のマーケティングAIシステム。そのすべてを公開します。",
    duration: 25,
    imagePrompt: `Grand manga showcase of system capabilities, circular arrangement of feature icons each in its own panel: AI marketing, Kindle books, video generation, app creation, research tools, all connected to central AI brain, exhibition hall atmosphere, ${MANGA_IMAGE_STYLE}, 9:16 vertical format`,
    imageCount: 9,
    imageInterval: 3000,
    nextSceneId: "s07c-bonus",
    style: systemStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "すべてお見せ\nします", emphasis: true, startTime: 0 },
      { text: "広告費ゼロで\n自動獲得", startTime: 5 },
      { text: "ショート動画\n毎日大量生成", startTime: 10 },
      { text: "話すだけで\nアプリ完成", emphasis: true, startTime: 16 },
      { text: "すべてを公開", emphasis: true, startTime: 21 },
    ],
  },
  {
    id: "s07c-bonus",
    type: "benefit",
    title: "参加特典",
    narration:
      "さらに参加特典があります。特典1、Gemini専用Gem20個を無料でプレゼント。マーケティングとビジネスに完全特化したカスタムツールGemを、セミナー当日から即座に活用できます。特典2、VIP優先案内の権利。2025年12月に募集を完全停止した先行者利益VIP枠。その優先案内を受け取る権利を、セミナー参加者だけにお届けします。",
    duration: 20,
    imagePrompt: `Treasure chest opening in manga style revealing golden Gemini Gem icons numbered 1-20, VIP golden ticket floating with exclusive stamp, gift boxes with sparkle effects, premium bonus package visualization, excited recipient character, ${MANGA_IMAGE_STYLE}, 9:16 vertical format`,
    imageCount: 7,
    imageInterval: 3000,
    nextSceneId: "s08c-goevolve",
    style: ctaStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "参加特典", emphasis: true, startTime: 0 },
      { text: "Gem20個を\n無料プレゼント", emphasis: true, startTime: 4 },
      { text: "セミナー当日から\n即座に活用", startTime: 10 },
      { text: "VIP優先案内の\n権利", emphasis: true, startTime: 15 },
    ],
  },
  {
    id: "s08c-goevolve",
    type: "cta",
    title: "進化を取りに行く",
    narration:
      "所要時間120分から180分。オンラインZoom開催。参加費は無料。先着30名様限定です。進化を取りに行く側でありたいと少しでも思うなら、今回の話を聞いておいて損することは決してありません。むしろ、1万倍の波に乗れるチャンスを掴めます。",
    duration: 14,
    imagePrompt: `Dynamic manga character reaching upward to grab golden opportunity orb, Zoom seminar interface glowing in background, 30 seats countdown, determined expression with clenched fist, rising energy wave, empowerment and action atmosphere, ${MANGA_IMAGE_STYLE}, 9:16 vertical format`,
    imageCount: 5,
    imageInterval: 3000,
    nextSceneId: "s10-final-cta",
    style: ctaStyle,
    mediaType: "image",
    keyPhrases: [
      { text: "参加費は無料", emphasis: true, startTime: 0 },
      { text: "先着30名限定", emphasis: true, startTime: 3 },
      { text: "損することは\n決してありません", startTime: 7 },
      { text: "1万倍の波に\n乗るチャンス", emphasis: true, startTime: 11 },
    ],
  },
] as const

// ==========================================
// 最終CTA（全ルート共通）
// ==========================================
const finalScene: Scene = {
  id: "s10-final-cta",
  type: "cta",
  title: "今すぐLINE登録",
  narration:
    "孫正義氏は問いかけました。2つの種類の人類がいるとしたら、進化を嫌う側と進化を求める側。あなたはどちらですか？自ら進化を否定する人間は、自らの未来を制限する。この言葉を聞いて何を感じましたか？どうせ、まだ早い。そう思って閉じるのも自由です。でもAIの進化は1年で1000倍。1年後にはもう今日と同じチャンスはありません。世界で0.5パーセントしか気づいていない今だからこそ先行者になれる。先着30名。進化を取りに行く決断をした方から席は埋まっていきます。今すぐLINE友だち追加で、次世代AI四次元ポケットシステムの先行案内を受け取ってください。あなたのご参加をお待ちしています。",
  duration: 35,
  imagePrompt: `Epic final manga scene, two diverging paths of humanity splitting cosmic space, massive LINE icon glowing green at center with inviting energy, countdown 30 seats with urgency pulse, golden and green particle effects swirling, emotional climax moment with hand reaching toward viewer, ${MANGA_IMAGE_STYLE}, 9:16 vertical format`,
  imageCount: 12,
  imageInterval: 3000,
  nextSceneId: null,
  style: ctaStyle,
  mediaType: "video",
  keyPhrases: [
    { text: "2つの種類の人類", emphasis: true, startTime: 0 },
    { text: "あなたは\nどちらですか？", startTime: 5 },
    { text: "1年で1000倍", emphasis: true, startTime: 12 },
    { text: "今日と同じ\nチャンスはない", startTime: 17 },
    { text: "先着30名", emphasis: true, startTime: 23 },
    { text: "今すぐ\nLINE登録", emphasis: true, startTime: 29 },
  ],
}

// ==========================================
// 完全なブランチ構造
// ==========================================
export const branchStructure: BranchStructure = {
  config: {
    title: "孫正義が予見するAI1万倍の世界 - 四次元ポケットシステム v2",
    pattern: "06-tech-futuristic",
    format: "9:16",
    resolution: { width: 1080, height: 1920 },
    fps: 30,
    tts: {
      engine: "fish-audio",
      voiceId: "d4c86c697b3e4fc090cf056f17530b2a",
      language: "ja",
      speed: 1.0,
      pitch: 1.0,
    },
    totalScenes: 20,
    maxPaths: 3,
  },
  scenes: [
    ...commonScenes,
    ...branchAScenes,
    ...branchBScenes,
    ...branchCScenes,
    finalScene,
  ],
  branchScenes: [choicePoint1],
  sceneGraph: {
    entrySceneId: "s01-hook",
    nodes: {
      // 共通導入部
      "s01-hook": { sceneId: "s01-hook", next: "s02-son" },
      "s02-son": { sceneId: "s02-son", next: "s03-two-types" },
      "s03-two-types": { sceneId: "s03-two-types", next: "cp1" },
      // 選択ポイント
      cp1: {
        sceneId: "cp1",
        next: null,
        choices: [
          "s04a-practice",
          "s04b-gap",
          "s04c-pocket",
        ],
      },
      // 分岐A: 証拠・実績ルート
      "s04a-practice": { sceneId: "s04a-practice", next: "s05a-ceo" },
      "s05a-ceo": { sceneId: "s05a-ceo", next: "s06a-beginner" },
      "s06a-beginner": { sceneId: "s06a-beginner", next: "s07a-top" },
      "s07a-top": { sceneId: "s07a-top", next: "s08a-join" },
      "s08a-join": { sceneId: "s08a-join", next: "s10-final-cta" },
      // 分岐B: 危機感・緊急性ルート
      "s04b-gap": { sceneId: "s04b-gap", next: "s05b-bubble" },
      "s05b-bubble": { sceneId: "s05b-bubble", next: "s06b-revolution" },
      "s06b-revolution": { sceneId: "s06b-revolution", next: "s07b-05percent" },
      "s07b-05percent": { sceneId: "s07b-05percent", next: "s08b-stillintime" },
      "s08b-stillintime": { sceneId: "s08b-stillintime", next: "s10-final-cta" },
      // 分岐C: 可能性・システムルート
      "s04c-pocket": { sceneId: "s04c-pocket", next: "s05c-evolution" },
      "s05c-evolution": { sceneId: "s05c-evolution", next: "s06c-seminar" },
      "s06c-seminar": { sceneId: "s06c-seminar", next: "s07c-bonus" },
      "s07c-bonus": { sceneId: "s07c-bonus", next: "s08c-goevolve" },
      "s08c-goevolve": { sceneId: "s08c-goevolve", next: "s10-final-cta" },
      // 最終CTA
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
