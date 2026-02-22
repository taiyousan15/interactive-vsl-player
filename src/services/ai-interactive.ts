// ==========================================
// AI インタラクティブ提案サービス
// ModelRouter を活用して最適モデルを選択し、
// ホットスポット・分岐・クイズを自動提案する
// ==========================================

import { ModelRouter } from '@/performance/ModelRouter'
import type { ModelType } from '@/performance/types'
import type { Scene } from '@/types/video'
import type {
  AIHotspotSuggestionResult,
  AIBranchSuggestionResult,
  AIQuizSuggestionResult,
  BranchRequestContext,
} from '@/types/ai-suggestions'

// Anthropic API model ID mapping
const ANTHROPIC_MODEL_IDS: Readonly<Partial<Record<ModelType, string>>> = {
  'claude-opus': 'claude-opus-4-6',
  'claude-sonnet': 'claude-sonnet-4-6',
  'claude-haiku': 'claude-haiku-4-5-20251001',
}

const OLLAMA_MODEL_IDS: Readonly<Partial<Record<ModelType, string>>> = {
  'ollama-qwen3-coder': 'qwen3-coder',
  'ollama-glm4': 'glm4',
}

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'

// --- LLM呼び出し ---

async function callOllama(model: string, prompt: string): Promise<string> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as { message: { content: string } }
  return data.message.content
}

async function callAnthropic(modelId: string, prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Anthropic API error: ${response.status} - ${errorText}`)
  }

  const data = (await response.json()) as { content: { type: string; text: string }[] }
  const textBlock = data.content.find((c) => c.type === 'text')
  if (!textBlock) {
    throw new Error('No text content in Anthropic response')
  }
  return textBlock.text
}

async function callLLM(modelType: ModelType, prompt: string): Promise<string> {
  const ollamaModel = OLLAMA_MODEL_IDS[modelType]
  if (ollamaModel) {
    return callOllama(ollamaModel, prompt)
  }

  const anthropicModelId = ANTHROPIC_MODEL_IDS[modelType]
  if (anthropicModelId) {
    return callAnthropic(anthropicModelId, prompt)
  }

  // openrouter-free フォールバック
  if (modelType === 'openrouter-free') {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured')
    }
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`)
    }
    const data = (await response.json()) as {
      choices: { message: { content: string } }[]
    }
    return data.choices[0]?.message?.content ?? ''
  }

  throw new Error(`Unsupported model type: ${modelType}`)
}

// --- JSON抽出 ---

function extractJSON(text: string): unknown {
  // ```json ... ``` ブロックを優先
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)```/)
  if (jsonBlockMatch?.[1]) {
    return JSON.parse(jsonBlockMatch[1].trim())
  }

  // ``` ... ``` ブロック（言語指定なし）
  const codeBlockMatch = text.match(/```\s*([\s\S]*?)```/)
  if (codeBlockMatch?.[1]) {
    const trimmed = codeBlockMatch[1].trim()
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return JSON.parse(trimmed)
    }
  }

  // 生のJSONオブジェクト
  const objectMatch = text.match(/\{[\s\S]*\}/)
  if (objectMatch?.[0]) {
    return JSON.parse(objectMatch[0])
  }

  throw new Error('LLMレスポンスにJSONが見つかりませんでした')
}

// --- プロンプト構築 ---

function buildHotspotPrompt(scene: Scene): string {
  const keyPhrasesText = scene.keyPhrases?.map((k) => k.text).join('、') ?? 'なし'
  return `あなたはインタラクティブ動画のUXデザイナーです。
以下のシーン情報を分析し、視聴者が最もエンゲージできるホットスポットとオーバーレイを提案してください。

## シーン情報
- シーンID: ${scene.id}
- タイプ: ${scene.type}
- タイトル: ${scene.title}
- ナレーション: ${scene.narration}
- 尺: ${scene.duration}秒
- キーフレーズ: ${keyPhrasesText}

## 要件
1〜2個のホットスポットと0〜1個のオーバーレイを提案してください。
位置はパーセント指定（0-100）、タイミングは秒指定。
shapeは rectangle/circle/pill のいずれか。
overlayのtypeは stat-card/info-panel/product-card のいずれか。
slideFromは left/right/top/bottom のいずれか。

必ず以下のJSON形式で回答してください（他のテキストは不要）:
\`\`\`json
{
  "hotspots": [
    {
      "id": "hs-${scene.id}-1",
      "label": "クリックラベル（10文字以内）",
      "position": { "x": 60, "y": 20, "width": 28, "height": 10 },
      "timing": { "showAt": 5, "hideAt": 15 },
      "action": { "type": "overlay", "overlayId": "ov-${scene.id}-1" },
      "shape": "pill",
      "rationale": "提案理由",
      "confidence": 0.85
    }
  ],
  "overlays": [
    {
      "id": "ov-${scene.id}-1",
      "type": "stat-card",
      "content": {
        "title": "タイトル",
        "stats": [{ "label": "統計名", "value": "値" }]
      },
      "timing": { "showAt": 5, "hideAt": null },
      "slideFrom": "right",
      "rationale": "提案理由",
      "confidence": 0.85
    }
  ]
}
\`\`\``
}

function buildBranchPrompt(scene: Scene, context: BranchRequestContext): string {
  const contextLines: string[] = []
  if (context.viewerEngagementRate !== undefined) {
    contextLines.push(`- エンゲージメント率: ${Math.round(context.viewerEngagementRate * 100)}%`)
  }
  if (context.previousChoices && context.previousChoices.length > 0) {
    contextLines.push(`- 過去の選択: ${context.previousChoices.join(', ')}`)
  }
  const contextSection = contextLines.length > 0
    ? `\n## 視聴者コンテキスト\n${contextLines.join('\n')}`
    : ''

  return `あなたはインタラクティブ動画のシナリオライターです。
以下のシーン情報から、視聴者を引き込む分岐選択肢を提案してください。

## シーン情報
- シーンID: ${scene.id}
- タイプ: ${scene.type}
- タイトル: ${scene.title}
- ナレーション: ${scene.narration}
- 尺: ${scene.duration}秒${contextSection}

## 要件
視聴者の属性・悩みに合わせた2〜3択の分岐を1〜2セット提案してください。
各選択肢は「自分向けだ」と感じられるものにしてください。
showAtはシーン開始からの秒数（尺の50〜70%付近を推奨）。

必ず以下のJSON形式で回答してください（他のテキストは不要）:
\`\`\`json
{
  "suggestions": [
    {
      "question": "あなたの現在の状況を教えてください",
      "options": [
        {
          "id": "opt_a",
          "label": "選択肢A（15文字以内）",
          "description": "選択肢Aの説明（30文字以内）",
          "intent": "対象とする視聴者層の説明"
        },
        {
          "id": "opt_b",
          "label": "選択肢B",
          "description": "選択肢Bの説明",
          "intent": "対象とする視聴者層の説明"
        }
      ],
      "showAt": 10,
      "rationale": "この分岐を提案した理由",
      "confidence": 0.80
    }
  ]
}
\`\`\``
}

function buildQuizPrompt(scene: Scene): string {
  return `あなたはeラーニングのコンテンツ設計者です。
以下のシーン情報から、視聴者の理解度を確認するクイズを作成してください。

## シーン情報
- シーンID: ${scene.id}
- タイプ: ${scene.type}
- タイトル: ${scene.title}
- ナレーション: ${scene.narration}
- 尺: ${scene.duration}秒

## 要件
1〜2問のクイズを作成してください。
ナレーションを聞いていれば答えられる内容にしてください。
選択肢は4つ（options配列のインデックス0〜3）、正解はcorrectIndexで指定。
showAtはシーン開始からの秒数（尺の70〜90%付近を推奨）。

必ず以下のJSON形式で回答してください（他のテキストは不要）:
\`\`\`json
{
  "quiz": [
    {
      "question": "クイズの質問文（30文字以内）",
      "options": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
      "correctIndex": 0,
      "explanation": "正解の解説（50文字以内）",
      "showAt": 20
    }
  ]
}
\`\`\``
}

// --- 公開API ---

export async function suggestHotspots(scene: Scene): Promise<AIHotspotSuggestionResult> {
  const router = new ModelRouter()
  const routeResult = await router.route({
    taskComplexity: 'simple',
    taskCategory: 'analysis',
    estimatedTokens: 800,
  })

  const prompt = buildHotspotPrompt(scene)
  const rawText = await callLLM(routeResult.model, prompt)

  const parsed = extractJSON(rawText) as {
    hotspots?: AIHotspotSuggestionResult['hotspots']
    overlays?: AIHotspotSuggestionResult['overlays']
  }

  return {
    sceneId: scene.id,
    hotspots: parsed.hotspots ?? [],
    overlays: parsed.overlays ?? [],
    model: routeResult.model,
    generatedAt: Date.now(),
  }
}

export async function suggestBranches(
  scene: Scene,
  context: BranchRequestContext = {}
): Promise<AIBranchSuggestionResult> {
  const router = new ModelRouter()
  const routeResult = await router.route({
    taskComplexity: 'moderate',
    taskCategory: 'writing',
    estimatedTokens: 1200,
  })

  const prompt = buildBranchPrompt(scene, context)
  const rawText = await callLLM(routeResult.model, prompt)

  const parsed = extractJSON(rawText) as {
    suggestions?: AIBranchSuggestionResult['suggestions']
  }

  return {
    sceneId: scene.id,
    suggestions: parsed.suggestions ?? [],
    model: routeResult.model,
    generatedAt: Date.now(),
  }
}

export async function suggestQuiz(scene: Scene): Promise<AIQuizSuggestionResult> {
  const router = new ModelRouter()
  const routeResult = await router.route({
    taskComplexity: 'simple',
    taskCategory: 'analysis',
    estimatedTokens: 800,
  })

  const prompt = buildQuizPrompt(scene)
  const rawText = await callLLM(routeResult.model, prompt)

  const parsed = extractJSON(rawText) as {
    quiz?: AIQuizSuggestionResult['quiz']
  }

  return {
    sceneId: scene.id,
    quiz: parsed.quiz ?? [],
    model: routeResult.model,
    generatedAt: Date.now(),
  }
}
