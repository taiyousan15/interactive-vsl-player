import { type NextRequest, NextResponse } from 'next/server'
import { suggestHotspots } from '@/services/ai-interactive'
import type { Scene } from '@/types/video'

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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { scene?: unknown }

    if (!isValidScene(body.scene)) {
      return NextResponse.json(
        { success: false, error: 'scene フィールドが不正です' },
        { status: 400 }
      )
    }

    const result = await suggestHotspots(body.scene)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
