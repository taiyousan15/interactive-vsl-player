"use client"

import { useState, useCallback } from "react"
import type { Poll, PollState, PollResults } from "@/types/poll"

interface PollOverlayProps {
  readonly poll: Poll
  readonly onVote: (pollId: string, selectedOptionIds: string[]) => void
  readonly onDismiss: (pollId: string) => void
  readonly externalResults?: PollResults | null
}

function buildLocalResults(
  poll: Poll,
  selectedIds: readonly string[]
): PollResults {
  const voteCounts: Record<string, number> = {}
  const percentages: Record<string, number> = {}

  for (const opt of poll.options) {
    voteCounts[opt.id] = selectedIds.includes(opt.id) ? 1 : 0
  }

  const total = selectedIds.length
  for (const opt of poll.options) {
    percentages[opt.id] = total > 0 && selectedIds.includes(opt.id) ? 100 : 0
  }

  return {
    pollId: poll.id,
    totalVotes: total,
    voteCounts,
    percentages,
  }
}

function ResultBar({
  label,
  emoji,
  percentage,
  isSelected,
}: {
  label: string
  emoji?: string
  percentage: number
  isSelected: boolean
}) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 font-medium text-white">
          {emoji && <span>{emoji}</span>}
          <span>{label}</span>
        </span>
        <span className={`font-bold ${isSelected ? "text-[#FFD700]" : "text-white/70"}`}>
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            background: isSelected
              ? "linear-gradient(90deg, #FFD700, #FF6347)"
              : "rgba(255,255,255,0.4)",
          }}
        />
      </div>
    </div>
  )
}

export function PollOverlay({
  poll,
  onVote,
  onDismiss,
  externalResults,
}: PollOverlayProps) {
  const [pollState, setPollState] = useState<PollState>({
    status: "active",
    selectedOptionIds: [],
    results: null,
  })

  const handleOptionToggle = useCallback(
    (optionId: string) => {
      if (pollState.status !== "active") return

      setPollState((prev) => {
        const alreadySelected = prev.selectedOptionIds.includes(optionId)
        if (poll.allowMultiple) {
          const next = alreadySelected
            ? prev.selectedOptionIds.filter((id) => id !== optionId)
            : [...prev.selectedOptionIds, optionId]
          return { ...prev, selectedOptionIds: next }
        }
        // single-select: toggle off if already selected
        return {
          ...prev,
          selectedOptionIds: alreadySelected ? [] : [optionId],
        }
      })
    },
    [pollState.status, poll.allowMultiple]
  )

  const handleVoteSubmit = useCallback(() => {
    if (pollState.selectedOptionIds.length === 0) return

    const results = externalResults ?? buildLocalResults(poll, pollState.selectedOptionIds)
    onVote(poll.id, [...pollState.selectedOptionIds])

    setPollState((prev) => ({
      ...prev,
      status: "voted",
      results,
    }))
  }, [poll, pollState.selectedOptionIds, externalResults, onVote])

  const isVoted = pollState.status === "voted"
  const results = pollState.results ?? externalResults ?? null

  return (
    <div
      className="pointer-events-auto absolute inset-x-3 z-[17] overflow-hidden rounded-2xl"
      style={{
        bottom: "80px",
        background: "rgba(10, 10, 20, 0.92)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 215, 0, 0.2)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div>
            <span className="mb-1 inline-block rounded-full bg-[#FFD700]/20 px-2 py-0.5 text-xs font-bold text-[#FFD700]">
              投票
            </span>
            <p className="text-sm font-bold leading-snug text-white">
              {poll.question}
            </p>
          </div>
          <button
            onClick={() => onDismiss(poll.id)}
            className="ml-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="閉じる"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Options or Results */}
        {isVoted && results ? (
          <div className="mb-3">
            {poll.options.map((opt) => (
              <ResultBar
                key={opt.id}
                label={opt.label}
                emoji={opt.emoji}
                percentage={results.percentages[opt.id] ?? 0}
                isSelected={pollState.selectedOptionIds.includes(opt.id)}
              />
            ))}
            <p className="mt-2 text-center text-xs text-white/50">
              回答ありがとうございます
            </p>
          </div>
        ) : (
          <div className="mb-3 space-y-2">
            {poll.options.map((opt) => {
              const isSelected = pollState.selectedOptionIds.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  onClick={() => handleOptionToggle(opt.id)}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-[#FFD700]/20 text-[#FFD700] ring-1 ring-[#FFD700]/60"
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {opt.emoji && <span className="text-base">{opt.emoji}</span>}
                    <span>{opt.label}</span>
                    {isSelected && (
                      <span className="ml-auto text-[#FFD700]">✓</span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Submit button */}
        {!isVoted && (
          <button
            onClick={handleVoteSubmit}
            disabled={pollState.selectedOptionIds.length === 0}
            className={`w-full rounded-xl py-2.5 text-sm font-bold transition-all ${
              pollState.selectedOptionIds.length > 0
                ? "bg-[#FFD700] text-black hover:bg-[#FFD700]/90"
                : "cursor-not-allowed bg-white/10 text-white/40"
            }`}
          >
            投票する
          </button>
        )}
      </div>
    </div>
  )
}
