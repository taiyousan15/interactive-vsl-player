// ==========================================
// 投票/クイズ 型定義 (Phase 3)
// ==========================================

// --- Poll (投票) ---

export interface PollOption {
  readonly id: string
  readonly label: string
  readonly emoji?: string
}

export interface Poll {
  readonly id: string
  readonly sceneId: string
  readonly question: string
  readonly options: readonly PollOption[]
  readonly showAt: number        // seconds
  readonly hideAt: number | null // seconds, null = stays until dismissed
  readonly allowMultiple: boolean
  readonly showResultsAfterVote: boolean
}

export interface PollVote {
  readonly pollId: string
  readonly selectedOptionIds: readonly string[]
  readonly votedAt: number
}

export interface PollResults {
  readonly pollId: string
  readonly totalVotes: number
  readonly voteCounts: Record<string, number>
  readonly percentages: Record<string, number>
}

export interface PollState {
  readonly status: 'idle' | 'active' | 'voted' | 'closed'
  readonly selectedOptionIds: readonly string[]
  readonly results: PollResults | null
}

// --- Quiz ---

export interface QuizQuestion {
  readonly id: string
  readonly text: string
  readonly options: readonly string[]
  readonly correctIndex: number
  readonly explanation: string
  readonly points: number
}

export interface Quiz {
  readonly id: string
  readonly sceneId: string
  readonly questions: readonly QuizQuestion[]
  readonly showAt: number
  readonly passingScore: number  // 0-100 percentage
  readonly showExplanationAfterAnswer: boolean
}

export interface QuizAnswer {
  readonly questionId: string
  readonly selectedIndex: number
  readonly isCorrect: boolean
  readonly answeredAt: number
}

export interface QuizState {
  readonly status: 'idle' | 'active' | 'answered' | 'completed'
  readonly currentQuestionIndex: number
  readonly answers: readonly QuizAnswer[]
  readonly score: number
  readonly totalPoints: number
  readonly earnedPoints: number
  readonly passed: boolean
}

// --- Scene Poll/Quiz Extension ---

export interface PollSceneData {
  readonly sceneId: string
  readonly polls: readonly Poll[]
  readonly quizzes: readonly Quiz[]
}
