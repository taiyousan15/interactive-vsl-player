import { NextResponse } from "next/server"
import { z } from "zod"

const VALID_EVENT_TYPES = [
  "hotspot_view",
  "hotspot_click",
  "overlay_view",
  "overlay_dismiss",
  "overlay_cta_click",
  "scene_engagement",
  "poll_answer",
  "quiz_answer",
] as const

const eventSchema = z.object({
  timestamp: z.number().int().min(0),
  sessionId: z.string().min(1).max(100),
  type: z.enum(VALID_EVENT_TYPES),
  sceneId: z.string().min(1).max(50),
  elementId: z.string().nullable(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
})

const payloadSchema = z.object({
  sessionId: z.string().min(1).max(100),
  events: z.array(eventSchema).min(1).max(100),
})

export async function POST(request: Request) {
  try {
    const rawBody: unknown = await request.json()
    const body = payloadSchema.parse(rawBody)

    // Phase 1: Log in dev only. Phase 3 will add DB persistence.
    if (process.env.NODE_ENV === "development") {
      console.info(
        `[Analytics] session=${body.sessionId} events=${body.events.length}`,
        body.events.map((e) => ({
          type: e.type,
          sceneId: e.sceneId,
          elementId: e.elementId,
        }))
      )
    }

    return NextResponse.json({
      success: true,
      data: { received: body.events.length },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid payload format" },
        { status: 400 }
      )
    }
    const message =
      error instanceof Error ? error.message : "Unknown error"
    console.error("[Analytics] POST error:", message)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
