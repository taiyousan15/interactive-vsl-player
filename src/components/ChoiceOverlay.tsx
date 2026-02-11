"use client"

import { useState, useEffect } from "react"
import type { ChoicePoint, ChoiceId } from "@/types/video"

interface ChoiceOverlayProps {
  readonly choicePoint: ChoicePoint
  readonly onChoice: (choiceId: ChoiceId, nextSceneId: string) => void
}

const ICONS: Record<string, string> = {
  rocket: "\u{1F680}",
  megaphone: "\u{1F4E3}",
  brain: "\u{1F9E0}",
  briefcase: "\u{1F4BC}",
  building: "\u{1F3E2}",
  graduation: "\u{1F393}",
  chat: "\u{1F4AC}",
  chart: "\u{1F4C8}",
  question: "\u{2753}",
  warning: "\u{26A0}\u{FE0F}",
  sparkles: "\u{2728}",
  heart: "\u{1F496}",
}

export function ChoiceOverlay({ choicePoint, onChoice }: ChoiceOverlayProps) {
  const [timeLeft, setTimeLeft] = useState(choicePoint.timeoutSeconds)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (timeLeft <= 0) {
      const defaultOption = choicePoint.options[choicePoint.defaultOptionIndex]
      onChoice(defaultOption.id, defaultOption.nextSceneId)
      return
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft, choicePoint, onChoice])

  function handleSelect(index: number) {
    if (selectedIndex !== null) return
    setSelectedIndex(index)
    const option = choicePoint.options[index]
    setTimeout(() => {
      onChoice(option.id, option.nextSceneId)
    }, 600)
  }

  return (
    <div
      className={`absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex w-full max-w-md flex-col items-center gap-6 px-6">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
          <span className="text-sm font-bold uppercase tracking-widest text-cyan-400">
            YOUR CHOICE
          </span>
          <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
        </div>

        <h3 className="text-center text-2xl font-bold text-white md:text-3xl">
          {choicePoint.question}
        </h3>

        <div className="mb-2 flex items-center gap-2 text-sm text-white/60">
          <TimerRing
            seconds={timeLeft}
            total={choicePoint.timeoutSeconds}
          />
          <span>{timeLeft}秒以内に選択してください</span>
        </div>

        <div className="flex w-full flex-col gap-3">
          {choicePoint.options.map((option, index) => (
            <button
              key={option.id}
              onClick={() => handleSelect(index)}
              disabled={selectedIndex !== null}
              className={`group flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-300 ${
                selectedIndex === index
                  ? "scale-105 border-cyan-400 bg-cyan-400/20 shadow-lg shadow-cyan-400/30"
                  : selectedIndex !== null
                    ? "border-white/10 opacity-30"
                    : "border-white/20 bg-white/5 hover:border-cyan-400/60 hover:bg-white/10"
              }`}
            >
              <span className="text-2xl">
                {ICONS[option.icon] ?? "\u{2728}"}
              </span>
              <div className="flex-1">
                <div className="text-base font-semibold text-white" style={{ wordBreak: "keep-all", overflowWrap: "anywhere" }}>
                  {option.label}
                </div>
                <div className="mt-1 text-sm text-white/60" style={{ wordBreak: "keep-all", overflowWrap: "anywhere" }}>
                  {option.description}
                </div>
              </div>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                  selectedIndex === index
                    ? "border-cyan-400 bg-cyan-400 text-black"
                    : "border-white/30 text-white/30 group-hover:border-cyan-400/60"
                }`}
              >
                {selectedIndex === index ? "\u2713" : String.fromCharCode(65 + index)}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function TimerRing({
  seconds,
  total,
}: {
  readonly seconds: number
  readonly total: number
}) {
  const ratio = seconds / total
  const circumference = 2 * Math.PI * 10
  const offset = circumference * (1 - ratio)

  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke={ratio > 0.3 ? "#00d4ff" : "#ff3366"}
        strokeWidth="2"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 12 12)"
        className="transition-all duration-1000 ease-linear"
      />
    </svg>
  )
}
