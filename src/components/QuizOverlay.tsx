"use client"

import { useState, useCallback } from "react"
import type { Quiz, QuizState, QuizAnswer } from "@/types/poll"

interface QuizOverlayProps {
  readonly quiz: Quiz
  readonly onComplete: (quizId: string, state: QuizState) => void
  readonly onDismiss: (quizId: string) => void
}

function buildInitialState(): QuizState {
  return {
    status: "active",
    currentQuestionIndex: 0,
    answers: [],
    score: 0,
    totalPoints: 0,
    earnedPoints: 0,
    passed: false,
  }
}

function ScoreDisplay({ state, passingScore }: { state: QuizState; passingScore: number }) {
  const percentage = state.totalPoints > 0
    ? Math.round((state.earnedPoints / state.totalPoints) * 100)
    : 0

  return (
    <div className="py-2 text-center">
      <div
        className={`mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-black ${
          state.passed
            ? "bg-green-500/20 text-green-400"
            : "bg-red-500/20 text-red-400"
        }`}
      >
        {percentage}%
      </div>
      <p className={`mb-1 text-base font-bold ${state.passed ? "text-green-400" : "text-red-400"}`}>
        {state.passed ? "合格！" : "もう少し！"}
      </p>
      <p className="text-xs text-white/60">
        {state.answers.filter((a) => a.isCorrect).length} / {state.answers.length} 問正解
        （合格ライン: {passingScore}%）
      </p>
    </div>
  )
}

export function QuizOverlay({ quiz, onComplete, onDismiss }: QuizOverlayProps) {
  const [quizState, setQuizState] = useState<QuizState>(buildInitialState)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const currentQuestion = quiz.questions[quizState.currentQuestionIndex]
  const isLastQuestion = quizState.currentQuestionIndex === quiz.questions.length - 1
  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0)

  const handleSelectOption = useCallback(
    (index: number) => {
      if (quizState.status !== "active") return
      setSelectedIndex(index)
    },
    [quizState.status]
  )

  const handleConfirmAnswer = useCallback(() => {
    if (selectedIndex === null || !currentQuestion) return

    const isCorrect = selectedIndex === currentQuestion.correctIndex
    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedIndex,
      isCorrect,
      answeredAt: Date.now(),
    }

    setQuizState((prev) => {
      const newAnswers = [...prev.answers, answer]
      const earnedPoints = prev.earnedPoints + (isCorrect ? currentQuestion.points : 0)

      if (isLastQuestion) {
        const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
        const passed = percentage >= quiz.passingScore
        const completed: QuizState = {
          ...prev,
          status: "completed",
          answers: newAnswers,
          earnedPoints,
          totalPoints,
          passed,
          score: Math.round(percentage),
        }
        onComplete(quiz.id, completed)
        return completed
      }

      return {
        ...prev,
        status: "answered",
        answers: newAnswers,
        earnedPoints,
      }
    })
  }, [selectedIndex, currentQuestion, isLastQuestion, totalPoints, quiz, onComplete])

  const handleNextQuestion = useCallback(() => {
    setSelectedIndex(null)
    setQuizState((prev) => ({
      ...prev,
      status: "active",
      currentQuestionIndex: prev.currentQuestionIndex + 1,
    }))
  }, [])

  const isAnswered = quizState.status === "answered" || quizState.status === "completed"
  const lastAnswer = quizState.answers[quizState.answers.length - 1] ?? null

  return (
    <div
      className="pointer-events-auto absolute inset-x-3 z-[17] overflow-hidden rounded-2xl"
      style={{
        bottom: "80px",
        background: "rgba(10, 10, 20, 0.92)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(79, 195, 247, 0.2)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block rounded-full bg-[#4FC3F7]/20 px-2 py-0.5 text-xs font-bold text-[#4FC3F7]">
              クイズ
            </span>
            {quizState.status !== "completed" && (
              <span className="text-xs text-white/50">
                {quizState.currentQuestionIndex + 1} / {quiz.questions.length}
              </span>
            )}
          </div>
          <button
            onClick={() => onDismiss(quiz.id)}
            className="flex h-6 w-6 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="閉じる"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </button>
        </div>

        {/* Score screen */}
        {quizState.status === "completed" ? (
          <ScoreDisplay state={quizState} passingScore={quiz.passingScore} />
        ) : (
          <>
            {/* Question */}
            <p className="mb-3 text-sm font-bold leading-snug text-white">
              {currentQuestion?.text}
            </p>

            {/* Options */}
            <div className="mb-3 space-y-2">
              {currentQuestion?.options.map((option, index) => {
                let optionStyle = "bg-white/5 text-white hover:bg-white/10"
                if (isAnswered) {
                  if (index === currentQuestion.correctIndex) {
                    optionStyle = "bg-green-500/20 text-green-300 ring-1 ring-green-500/60"
                  } else if (index === lastAnswer?.selectedIndex && !lastAnswer.isCorrect) {
                    optionStyle = "bg-red-500/20 text-red-300 ring-1 ring-red-500/60"
                  } else {
                    optionStyle = "bg-white/5 text-white/40"
                  }
                } else if (selectedIndex === index) {
                  optionStyle = "bg-[#4FC3F7]/20 text-[#4FC3F7] ring-1 ring-[#4FC3F7]/60"
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleSelectOption(index)}
                    disabled={isAnswered}
                    className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${optionStyle}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                      {isAnswered && index === currentQuestion.correctIndex && (
                        <span className="ml-auto text-green-400">✓</span>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Explanation */}
            {isAnswered && quiz.showExplanationAfterAnswer && (
              <div className="mb-3 rounded-xl bg-white/5 px-3 py-2">
                <p className="text-xs leading-relaxed text-white/70">
                  <span className="mr-1 font-bold text-[#4FC3F7]">解説:</span>
                  {currentQuestion?.explanation}
                </p>
              </div>
            )}

            {/* Action buttons */}
            {!isAnswered ? (
              <button
                onClick={handleConfirmAnswer}
                disabled={selectedIndex === null}
                className={`w-full rounded-xl py-2.5 text-sm font-bold transition-all ${
                  selectedIndex !== null
                    ? "bg-[#4FC3F7] text-black hover:bg-[#4FC3F7]/90"
                    : "cursor-not-allowed bg-white/10 text-white/40"
                }`}
              >
                回答する
              </button>
            ) : (
              !isLastQuestion && (
                <button
                  onClick={handleNextQuestion}
                  className="w-full rounded-xl bg-[#4FC3F7]/20 py-2.5 text-sm font-bold text-[#4FC3F7] transition-all hover:bg-[#4FC3F7]/30"
                >
                  次の問題へ →
                </button>
              )
            )}
          </>
        )}
      </div>
    </div>
  )
}
