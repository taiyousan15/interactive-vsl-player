import { type NextRequest, NextResponse } from 'next/server'
import { suggestBranches } from '@/services/ai-interactive'
import type { Scene } from '@/types/video'
import type { BranchRequestContext } from '@/types/ai-suggestions'

function isValidScene(value: unknown): value is Scene {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.narration === 'string' &&
    typeof obj.duration === 'number'
  )
}

function parseContext(value: unknown): BranchRequestContext {
  if (typeof value !== 'object' || value === null) return {}
  const obj = value as Record<string, unknown>
  return {
    viewerEngagementRate:
      typeof obj.viewerEngagementRate === 'number' ? obj.viewerEngagementRate : undefined,
    previousChoices: Array.isArray(obj.previousChoices)
      ? (obj.previousChoices as string[]).filter((c) => typeof c === 'string')
      : undefined,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { scene?: unknown; context?: unknown }

    if (!isValidScene(body.scene)) {
      return NextResponse.json(
        { success: false, error: 'scene フィールドが不正です' },
        { status: 400 }
      )
    }

    const context = parseContext(body.context)
    const result = await suggestBranches(body.scene, context)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
