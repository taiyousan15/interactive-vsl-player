"use client"

import { useVideoPlayer } from "@/hooks/useVideoPlayer"
import { SceneRenderer } from "@/components/SceneRenderer"
import { ChoiceOverlay } from "@/components/ChoiceOverlay"
import type { BranchScene } from "@/types/video"

export function VideoPlayer() {
  const {
    currentScene,
    isPlaying,
    isChoiceVisible,
    choices,
    play,
    pause,
    makeChoice,
    advanceScene,
    restart,
  } = useVideoPlayer()

  const isBranchScene = currentScene.type === "choice"
  const branchScene = isBranchScene ? (currentScene as BranchScene) : null
  const isFinished = currentScene.nextSceneId === null && currentScene.type !== "choice"

  return (
    <div className="relative mx-auto flex aspect-[9/16] w-full max-w-[430px] flex-col overflow-hidden rounded-2xl bg-black shadow-2xl shadow-cyan-500/10">
      <SceneRenderer
        scene={currentScene}
        isPlaying={isPlaying}
        onSceneEnd={advanceScene}
      />

      {isChoiceVisible && branchScene && (
        <ChoiceOverlay
          choicePoint={branchScene.choicePoint}
          onChoice={makeChoice}
        />
      )}

      <div className="absolute bottom-4 left-0 right-0 z-30 flex items-center justify-center gap-3 px-4">
        {!isPlaying && !isChoiceVisible && !isFinished && (
          <button
            onClick={play}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/90 text-white shadow-lg shadow-cyan-500/30 transition-all hover:bg-cyan-400 hover:scale-105"
            aria-label="Play"
          >
            <PlayIcon />
          </button>
        )}

        {isPlaying && (
          <button
            onClick={pause}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
            aria-label="Pause"
          >
            <PauseIcon />
          </button>
        )}

        {isFinished && (
          <div className="flex flex-col items-center gap-3">
            <a
              href="https://line.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-14 items-center gap-2 rounded-2xl bg-[#06C755] px-6 py-3 text-center text-sm font-bold leading-tight text-white shadow-lg shadow-green-500/30 transition-all hover:bg-[#05b64d] hover:scale-105"
              style={{ wordBreak: "keep-all" }}
            >
              <LineIcon />
              <span className="flex flex-col">
                <span>次世代AI四次元ポケットシステムを</span>
                <span>先行案内で知る権利を得る</span>
              </span>
            </a>
            <button
              onClick={restart}
              className="text-sm text-white/50 underline transition-colors hover:text-white/80"
            >
              もう一度見る
            </button>
          </div>
        )}
      </div>

      {choices.length > 0 && (
        <div className="absolute right-3 top-3 z-30 flex gap-1">
          {choices.map((_, i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-cyan-400"
            />
          ))}
          {Array.from({ length: 1 - choices.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="h-2 w-2 rounded-full bg-white/20"
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M6 4l12 6-12 6V4z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <rect x="5" y="4" width="4" height="12" rx="1" />
      <rect x="11" y="4" width="4" height="12" rx="1" />
    </svg>
  )
}

function LineIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 5.81 2 10.41c0 4.15 3.68 7.63 8.66 8.28.34.07.8.22.91.51.1.26.07.66.03.92l-.15.89c-.04.26-.21 1.01.89.55 1.1-.46 5.93-3.49 8.09-5.98C22.19 13.63 22 11.99 22 10.41 22 5.81 17.52 2 12 2z" />
    </svg>
  )
}
