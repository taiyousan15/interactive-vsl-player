"use client"

import { useEffect, useState, useCallback } from "react"
import type { ChoicePoint, ChoiceId } from "@/types/video"

interface ChoiceUIProps {
  readonly choicePoint: ChoicePoint
  readonly onChoice: (choiceId: ChoiceId, targetSceneId: string) => void
}

const icons: Record<string, string> = {
  rocket: "\u{1F680}",
  megaphone: "\u{1F4E3}",
  brain: "\u{1F9E0}",
  briefcase: "\u{1F4BC}",
  building: "\u{1F3E2}",
  graduation: "\u{1F393}",
  chat: "\u{1F4AC}",
  chart: "\u{1F4C8}",
  question: "\u{2753}",
}

export function ChoiceUI({ choicePoint, onChoice }: ChoiceUIProps) {
  const [countdown, setCountdown] = useState(choicePoint.timeoutSeconds)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (countdown <= 0) {
      const defaultOption = choicePoint.options[choicePoint.defaultOptionIndex]
      onChoice(defaultOption.id, defaultOption.nextSceneId)
      return
    }

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [countdown, choicePoint, onChoice])

  const handleChoice = useCallback(
    (index: number) => {
      if (selectedIndex !== null) return
      setSelectedIndex(index)
      const option = choicePoint.options[index]
      setTimeout(() => {
        onChoice(option.id, option.nextSceneId)
      }, 600)
    },
    [selectedIndex, choicePoint.options, onChoice]
  )

  return (
    <div
      className={`flex flex-col items-center gap-6 px-4 transition-all duration-700 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <h3 className="text-xl font-bold text-cyan-400 sm:text-2xl">
        {choicePoint.question}
      </h3>

      <div className="flex w-full max-w-sm flex-col gap-3">
        {choicePoint.options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => handleChoice(index)}
            disabled={selectedIndex !== null}
            className={`group relative flex items-center gap-4 rounded-xl border px-4 py-4 text-left transition-all duration-300 ${
              selectedIndex === index
                ? "scale-105 border-cyan-400 bg-cyan-400/20"
                : selectedIndex !== null
                  ? "scale-95 border-white/5 bg-white/5 opacity-40"
                  : "border-white/10 bg-white/5 hover:scale-[1.02] hover:border-cyan-400/50 hover:bg-white/10"
            }`}
          >
            <span className="text-2xl">{icons[option.icon] ?? "?"}</span>

            <div className="flex flex-1 flex-col">
              <span className="text-sm font-semibold text-white sm:text-base">
                {option.label}
              </span>
              <span className="text-xs text-white/60">{option.description}</span>
            </div>

            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                selectedIndex === index
                  ? "bg-cyan-400 text-black"
                  : "border border-white/20 text-white/40 group-hover:border-cyan-400/50 group-hover:text-cyan-400"
              }`}
            >
              {String.fromCharCode(65 + index)}
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm text-white/40">
        <CountdownRing seconds={countdown} total={choicePoint.timeoutSeconds} />
        <span>
          {countdown > 0
            ? `自動選択まで ${countdown}秒`
            : "選択中..."}
        </span>
      </div>
    </div>
  )
}

function CountdownRing({
  seconds,
  total,
}: {
  readonly seconds: number
  readonly total: number
}) {
  const progress = seconds / total
  const circumference = 2 * Math.PI * 12
  const dashOffset = circumference * (1 - progress)

  return (
    <svg width="28" height="28" viewBox="0 0 28 28">
      <circle
        cx="14"
        cy="14"
        r="12"
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="2"
      />
      <circle
        cx="14"
        cy="14"
        r="12"
        fill="none"
        stroke="#00d4ff"
        strokeWidth="2"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform="rotate(-90 14 14)"
        className="transition-all duration-1000 ease-linear"
      />
    </svg>
  )
}
