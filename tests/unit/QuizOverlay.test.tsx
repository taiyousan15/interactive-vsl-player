/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { QuizOverlay } from '../../src/components/QuizOverlay'
import type { Quiz, QuizState } from '../../src/types/poll'

const mockQuiz: Quiz = {
  id: 'quiz-test',
  sceneId: 's01',
  questions: [
    {
      id: 'q1',
      text: '日本のAI活用率は約何%ですか？',
      options: ['5%', '45%', '70%', '90%'],
      correctIndex: 1,
      explanation: '日本企業のAI活用率は約45%と言われています。',
      points: 10,
    },
    {
      id: 'q2',
      text: 'AI導入で最も多い用途は？',
      options: ['画像生成', 'テキスト処理', 'ロボット制御', 'セキュリティ'],
      correctIndex: 1,
      explanation: 'テキスト処理・文章要約・翻訳が最も一般的な用途です。',
      points: 10,
    },
  ],
  showAt: 5,
  passingScore: 80,
  showExplanationAfterAnswer: true,
}

const mockOnComplete = jest.fn()
const mockOnDismiss = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
})

// ========================
// Rendering
// ========================

describe('QuizOverlay - rendering', () => {
  test('renders first question text', () => {
    render(
      <QuizOverlay quiz={mockQuiz} onComplete={mockOnComplete} onDismiss={mockOnDismiss} />
    )
    expect(screen.getByText('日本のAI活用率は約何%ですか？')).toBeInTheDocument()
  })

  test('renders all options for first question', () => {
    render(
      <QuizOverlay quiz={mockQuiz} onComplete={mockOnComplete} onDismiss={mockOnDismiss} />
    )
    expect(screen.getByText('5%')).toBeInTheDocument()
    expect(screen.getByText('45%')).toBeInTheDocument()
    expect(screen.getByText('70%')).toBeInTheDocument()
    expect(screen.getByText('90%')).toBeInTheDocument()
  })

  test('renders クイズ badge', () => {
    render(
      <QuizOverlay quiz={mockQuiz} onComplete={mockOnComplete} onDismiss={mockOnDismiss} />
    )
    expect(screen.getByText('クイズ')).toBeInTheDocument()
  })

  test('shows question counter', () => {
    render(
      <QuizOverlay quiz={mockQuiz} onComplete={mockOnComplete} onDismiss={mockOnDismiss} />
    )
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  test('回答する button is initially disabled', () => {
    render(
      <QuizOverlay quiz={mockQuiz} onComplete={mockOnComplete} onDismiss={mockOnDismiss} />
    )
    expect(screen.getByText('回答する')).toBeDisabled()
  })
})

// ========================
// Answer flow - correct
// ========================

describe('QuizOverlay - correct answer', () => {
  test('selecting correct option enables submit button', () => {
    render(
      <QuizOverlay quiz={mockQuiz} onComplete={mockOnComplete} onDismiss={mockOnDismiss} />
    )
    fireEvent.click(screen.getByText('45%'))
    expect(screen.getByText('回答する')).not.toBeDisabled()
  })

  test('shows explanation after answering when showExplanationAfterAnswer is true', () => {
    render(
      <QuizOverlay quiz={mockQuiz} onComplete={mockOnComplete} onDismiss={mockOnDismiss} />
    )
    fireEvent.click(screen.getByText('45%'))
    fireEvent.click(screen.getByText('回答する'))

    expect(screen.getByText(/日本企業のAI活用率は約45%/)).toBeInTheDocument()
  })

  test('shows 次の問題へ after answering non-last question', () => {
    render(
      <QuizOverlay quiz={mockQuiz} onComplete={mockOnComplete} onDismiss={mockOnDismiss} />
    )
    fireEvent.click(screen.getByText('45%'))
    fireEvent.click(screen.getByText('回答する'))

    expect(screen.getByText('次の問題へ →')).toBeInTheDocument()
  })
})

// ========================
// Answer flow - wrong
// ========================

describe('QuizOverlay - wrong answer', () => {
  test('wrong answer does not advance to success immediately', () => {
    render(
      <QuizOverlay quiz={mockQuiz} onComplete={mockOnComplete} onDismiss={mockOnDismiss} />
    )
    fireEvent.click(screen.getByText('5%')) // wrong
    fireEvent.click(screen.getByText('回答する'))

    // Still showing first question explanation, not score screen
    expect(screen.queryByText('合格！')).not.toBeInTheDocument()
    expect(screen.queryByText('もう少し！')).not.toBeInTheDocument()
  })

  test('shows explanation even for wrong answer', () => {
    render(
      <QuizOverlay quiz={mockQuiz} onComplete={mockOnComplete} onDismiss={mockOnDismiss} />
    )
    fireEvent.click(screen.getByText('5%'))
    fireEvent.click(screen.getByText('回答する'))

    expect(screen.getByText(/日本企業のAI活用率は約45%/)).toBeInTheDocument()
  })
})

// ========================
// Navigation
// ========================

describe('QuizOverlay - navigation', () => {
  test('clicking 次の問題へ shows second question', () => {
    render(
      <QuizOverlay quiz={mockQuiz} onComplete={mockOnComplete} onDismiss={mockOnDismiss} />
    )
    fireEvent.click(screen.getByText('45%'))
    fireEvent.click(screen.getByText('回答する'))
    fireEvent.click(screen.getByText('次の問題へ →'))

    expect(screen.getByText('AI導入で最も多い用途は？')).toBeInTheDocument()
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
  })

  test('second question shows correct options', () => {
    render(
      <QuizOverlay quiz={mockQuiz} onComplete={mockOnComplete} onDismiss={mockOnDismiss} />
    )
    fireEvent.click(screen.getByText('45%'))
    fireEvent.click(screen.getByText('回答する'))
    fireEvent.click(screen.getByText('次の問題へ →'))

    expect(screen.getByText('テキスト処理')).toBeInTheDocument()
  })
})

// ========================
// Completion
// ========================

describe('QuizOverlay - completion', () => {
  function completeQuizAllCorrect() {
    render(
      <QuizOverlay quiz={mockQuiz} onComplete={mockOnComplete} onDismiss={mockOnDismiss} />
    )
    // Q1: 45% (correct)
    fireEvent.click(screen.getByText('45%'))
    fireEvent.click(screen.getByText('回答する'))
    fireEvent.click(screen.getByText('次の問題へ →'))
    // Q2: テキスト処理 (correct)
    fireEvent.click(screen.getByText('テキスト処理'))
    fireEvent.click(screen.getByText('回答する'))
  }

  test('calls onComplete when last question answered', () => {
    completeQuizAllCorrect()
    expect(mockOnComplete).toHaveBeenCalledTimes(1)
    expect(mockOnComplete).toHaveBeenCalledWith('quiz-test', expect.objectContaining({
      status: 'completed',
      passed: true,
    }))
  })

  test('shows score display after completing all questions', () => {
    completeQuizAllCorrect()
    expect(screen.getByText('合格！')).toBeInTheDocument()
  })

  test('shows 100% score for all-correct answers', () => {
    completeQuizAllCorrect()
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  test('shows failure when score is below passing threshold', () => {
    render(
      <QuizOverlay quiz={mockQuiz} onComplete={mockOnComplete} onDismiss={mockOnDismiss} />
    )
    // Q1: wrong
    fireEvent.click(screen.getByText('5%'))
    fireEvent.click(screen.getByText('回答する'))
    fireEvent.click(screen.getByText('次の問題へ →'))
    // Q2: wrong
    fireEvent.click(screen.getByText('画像生成'))
    fireEvent.click(screen.getByText('回答する'))

    expect(screen.getByText('もう少し！')).toBeInTheDocument()
    const completedState = mockOnComplete.mock.calls[0][1] as QuizState
    expect(completedState.passed).toBe(false)
  })
})

// ========================
// Dismiss
// ========================

describe('QuizOverlay - dismiss', () => {
  test('calls onDismiss with quiz id when close clicked', () => {
    render(
      <QuizOverlay quiz={mockQuiz} onComplete={mockOnComplete} onDismiss={mockOnDismiss} />
    )
    fireEvent.click(screen.getByLabelText('閉じる'))
    expect(mockOnDismiss).toHaveBeenCalledWith('quiz-test')
  })
})

// ========================
// No explanation mode
// ========================

describe('QuizOverlay - showExplanationAfterAnswer false', () => {
  const noExplainQuiz: Quiz = { ...mockQuiz, id: 'quiz-no-explain', showExplanationAfterAnswer: false }

  test('does not show explanation when flag is false', () => {
    render(
      <QuizOverlay quiz={noExplainQuiz} onComplete={mockOnComplete} onDismiss={mockOnDismiss} />
    )
    fireEvent.click(screen.getByText('45%'))
    fireEvent.click(screen.getByText('回答する'))

    expect(screen.queryByText(/日本企業のAI活用率/)).not.toBeInTheDocument()
  })
})
