/**
 * @jest-environment node
 */

// ==========================================
// Phase 3: poll.ts 型 + テンプレート 単体テスト
// ==========================================

import type {
  Poll,
  PollOption,
  PollState,
  PollVote,
  PollResults,
  Quiz,
  QuizQuestion,
  QuizState,
  QuizAnswer,
  PollSceneData,
} from '../../src/types/poll'

import { productDemoTemplate } from '../../src/data/templates/product-demo'
import { educationalTemplate } from '../../src/data/templates/educational'
import { salesFunnelTemplate } from '../../src/data/templates/sales-funnel'

// ========================
// Poll types shape test
// ========================

describe('Poll type structure', () => {
  test('Poll object satisfies type contract', () => {
    const poll: Poll = {
      id: 'poll-1',
      sceneId: 's01',
      question: 'テスト質問',
      options: [
        { id: 'opt_a', label: '選択肢A', emoji: '🅰️' },
        { id: 'opt_b', label: '選択肢B' },
      ],
      showAt: 5,
      hideAt: null,
      allowMultiple: false,
      showResultsAfterVote: true,
    }

    expect(poll.id).toBe('poll-1')
    expect(poll.options).toHaveLength(2)
    expect(poll.allowMultiple).toBe(false)
  })

  test('PollOption without emoji is valid', () => {
    const opt: PollOption = { id: 'opt_a', label: '選択肢A' }
    expect(opt.emoji).toBeUndefined()
  })

  test('PollState starts with idle status', () => {
    const state: PollState = {
      status: 'idle',
      selectedOptionIds: [],
      results: null,
    }
    expect(state.status).toBe('idle')
    expect(state.selectedOptionIds).toHaveLength(0)
    expect(state.results).toBeNull()
  })

  test('PollVote records selected options', () => {
    const vote: PollVote = {
      pollId: 'poll-1',
      selectedOptionIds: ['opt_a'],
      votedAt: Date.now(),
    }
    expect(vote.selectedOptionIds).toContain('opt_a')
  })

  test('PollResults sums to totalVotes', () => {
    const results: PollResults = {
      pollId: 'poll-1',
      totalVotes: 3,
      voteCounts: { opt_a: 2, opt_b: 1 },
      percentages: { opt_a: 66.7, opt_b: 33.3 },
    }
    const total = Object.values(results.voteCounts).reduce((a, b) => a + b, 0)
    expect(total).toBe(results.totalVotes)
  })
})

// ========================
// Quiz types shape test
// ========================

describe('Quiz type structure', () => {
  const question: QuizQuestion = {
    id: 'q1',
    text: 'テスト問題',
    options: ['A', 'B', 'C', 'D'],
    correctIndex: 0,
    explanation: '解説テキスト',
    points: 10,
  }

  test('QuizQuestion has correct structure', () => {
    expect(question.options).toHaveLength(4)
    expect(question.correctIndex).toBe(0)
    expect(question.points).toBe(10)
  })

  test('Quiz object satisfies type contract', () => {
    const quiz: Quiz = {
      id: 'quiz-1',
      sceneId: 's01',
      questions: [question],
      showAt: 5,
      passingScore: 80,
      showExplanationAfterAnswer: true,
    }

    expect(quiz.questions).toHaveLength(1)
    expect(quiz.passingScore).toBe(80)
  })

  test('QuizState tracks progress', () => {
    const answer: QuizAnswer = {
      questionId: 'q1',
      selectedIndex: 0,
      isCorrect: true,
      answeredAt: Date.now(),
    }

    const state: QuizState = {
      status: 'answered',
      currentQuestionIndex: 0,
      answers: [answer],
      score: 100,
      totalPoints: 10,
      earnedPoints: 10,
      passed: true,
    }

    expect(state.answers).toHaveLength(1)
    expect(state.passed).toBe(true)
    expect(state.score).toBe(100)
  })

  test('QuizState can represent failure', () => {
    const state: QuizState = {
      status: 'completed',
      currentQuestionIndex: 0,
      answers: [
        { questionId: 'q1', selectedIndex: 1, isCorrect: false, answeredAt: Date.now() },
      ],
      score: 0,
      totalPoints: 10,
      earnedPoints: 0,
      passed: false,
    }

    expect(state.passed).toBe(false)
    expect(state.score).toBe(0)
  })
})

// ========================
// productDemoTemplate
// ========================

describe('productDemoTemplate', () => {
  test('has correct metadata', () => {
    expect(productDemoTemplate.id).toBe('product-demo')
    expect(productDemoTemplate.category).toBe('sales')
    expect(productDemoTemplate.recommendedScenes.length).toBeGreaterThan(0)
  })

  test('getInteractiveData returns hotspots for intro scene', () => {
    const data = productDemoTemplate.getInteractiveData('intro')
    expect(data.sceneId).toBe('intro')
    expect(data.hotspots.length).toBeGreaterThan(0)
    expect(data.overlays.length).toBeGreaterThan(0)
  })

  test('getInteractiveData returns empty data for unknown scene', () => {
    const data = productDemoTemplate.getInteractiveData('unknown-scene-xyz')
    expect(data.hotspots).toHaveLength(0)
    expect(data.overlays).toHaveLength(0)
  })

  test('getPollData returns polls for features scene', () => {
    const data = productDemoTemplate.getPollData('features')
    expect(data.sceneId).toBe('features')
    expect(data.polls.length).toBeGreaterThan(0)
    expect(data.polls[0].options.length).toBeGreaterThanOrEqual(2)
  })

  test('getPollData returns quizzes for knowledge-check scene', () => {
    const data = productDemoTemplate.getPollData('knowledge-check')
    expect(data.quizzes.length).toBeGreaterThan(0)
    expect(data.quizzes[0].questions.length).toBeGreaterThan(0)
  })

  test('getPollData returns empty data for unknown scene', () => {
    const data: PollSceneData = productDemoTemplate.getPollData('xyz-unknown')
    expect(data.polls).toHaveLength(0)
    expect(data.quizzes).toHaveLength(0)
  })

  test('all hotspots have valid timing', () => {
    for (const sceneId of productDemoTemplate.recommendedScenes) {
      const data = productDemoTemplate.getInteractiveData(sceneId)
      for (const hs of data.hotspots) {
        expect(hs.timing.showAt).toBeGreaterThanOrEqual(0)
        if (hs.timing.hideAt !== null) {
          expect(hs.timing.hideAt).toBeGreaterThan(hs.timing.showAt)
        }
      }
    }
  })
})

// ========================
// educationalTemplate
// ========================

describe('educationalTemplate', () => {
  test('has correct metadata', () => {
    expect(educationalTemplate.id).toBe('educational')
    expect(educationalTemplate.category).toBe('education')
  })

  test('getInteractiveData returns data for lesson-intro', () => {
    const data = educationalTemplate.getInteractiveData('lesson-intro')
    expect(data.hotspots.length).toBeGreaterThan(0)
  })

  test('getPollData contains prior-knowledge poll', () => {
    const data = educationalTemplate.getPollData('lesson-intro')
    const poll = data.polls.find((p) => p.id === 'poll-prior-knowledge')
    expect(poll).toBeDefined()
    expect(poll?.options.length).toBe(4)
  })

  test('quiz has multiple questions', () => {
    const data = educationalTemplate.getPollData('practice')
    expect(data.quizzes[0].questions.length).toBeGreaterThanOrEqual(2)
  })

  test('quiz passingScore is between 0 and 100', () => {
    const data = educationalTemplate.getPollData('practice')
    for (const quiz of data.quizzes) {
      expect(quiz.passingScore).toBeGreaterThanOrEqual(0)
      expect(quiz.passingScore).toBeLessThanOrEqual(100)
    }
  })

  test('all quiz questions have 4 options', () => {
    const data = educationalTemplate.getPollData('practice')
    for (const quiz of data.quizzes) {
      for (const q of quiz.questions) {
        expect(q.options).toHaveLength(4)
      }
    }
  })
})

// ========================
// salesFunnelTemplate
// ========================

describe('salesFunnelTemplate', () => {
  test('has correct metadata', () => {
    expect(salesFunnelTemplate.id).toBe('sales-funnel')
    expect(salesFunnelTemplate.category).toBe('sales')
    expect(salesFunnelTemplate.recommendedScenes).toContain('awareness')
  })

  test('awareness scene has hotspots and overlays', () => {
    const data = salesFunnelTemplate.getInteractiveData('awareness')
    expect(data.hotspots.length).toBeGreaterThan(0)
    expect(data.overlays.length).toBeGreaterThan(0)
  })

  test('action scene has CTA hotspot with url action', () => {
    const data = salesFunnelTemplate.getInteractiveData('action')
    const ctaHotspot = data.hotspots.find((h) => h.action.type === 'url')
    expect(ctaHotspot).toBeDefined()
  })

  test('awareness poll has pain-point question', () => {
    const data = salesFunnelTemplate.getPollData('awareness')
    const poll = data.polls.find((p) => p.id === 'poll-pain-point')
    expect(poll).toBeDefined()
    expect(poll?.options.length).toBe(4)
  })

  test('interest poll shows results after vote setting', () => {
    const data = salesFunnelTemplate.getPollData('interest')
    const poll = data.polls.find((p) => p.id === 'poll-readiness')
    expect(poll).toBeDefined()
    expect(poll?.showResultsAfterVote).toBe(false)
  })

  test('all overlays have unique IDs within a scene', () => {
    for (const sceneId of salesFunnelTemplate.recommendedScenes) {
      const data = salesFunnelTemplate.getInteractiveData(sceneId)
      const ids = data.overlays.map((o) => o.id)
      const unique = new Set(ids)
      expect(unique.size).toBe(ids.length)
    }
  })
})
