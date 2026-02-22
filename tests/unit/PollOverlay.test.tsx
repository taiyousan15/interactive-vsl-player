/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { PollOverlay } from '../../src/components/PollOverlay'
import type { Poll } from '../../src/types/poll'

const mockPoll: Poll = {
  id: 'poll-test',
  sceneId: 's01',
  question: 'あなたの現在の状況は？',
  options: [
    { id: 'opt_a', label: 'AIを既に使っている', emoji: '🤖' },
    { id: 'opt_b', label: 'まだ使っていない', emoji: '🌱' },
    { id: 'opt_c', label: '検討中', emoji: '🤔' },
  ],
  showAt: 5,
  hideAt: null,
  allowMultiple: false,
  showResultsAfterVote: true,
}

const mockOnVote = jest.fn()
const mockOnDismiss = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
})

// ========================
// Rendering
// ========================

describe('PollOverlay - rendering', () => {
  test('renders question text', () => {
    render(
      <PollOverlay poll={mockPoll} onVote={mockOnVote} onDismiss={mockOnDismiss} />
    )
    expect(screen.getByText('あなたの現在の状況は？')).toBeInTheDocument()
  })

  test('renders all option labels', () => {
    render(
      <PollOverlay poll={mockPoll} onVote={mockOnVote} onDismiss={mockOnDismiss} />
    )
    expect(screen.getByText('AIを既に使っている')).toBeInTheDocument()
    expect(screen.getByText('まだ使っていない')).toBeInTheDocument()
    expect(screen.getByText('検討中')).toBeInTheDocument()
  })

  test('renders emoji for options', () => {
    render(
      <PollOverlay poll={mockPoll} onVote={mockOnVote} onDismiss={mockOnDismiss} />
    )
    expect(screen.getByText('🤖')).toBeInTheDocument()
    expect(screen.getByText('🌱')).toBeInTheDocument()
  })

  test('renders vote button initially', () => {
    render(
      <PollOverlay poll={mockPoll} onVote={mockOnVote} onDismiss={mockOnDismiss} />
    )
    expect(screen.getByText('投票する')).toBeInTheDocument()
  })

  test('renders 投票 badge', () => {
    render(
      <PollOverlay poll={mockPoll} onVote={mockOnVote} onDismiss={mockOnDismiss} />
    )
    expect(screen.getByText('投票')).toBeInTheDocument()
  })
})

// ========================
// Selection behavior
// ========================

describe('PollOverlay - selection', () => {
  test('selecting an option enables vote button', () => {
    render(
      <PollOverlay poll={mockPoll} onVote={mockOnVote} onDismiss={mockOnDismiss} />
    )
    fireEvent.click(screen.getByText('AIを既に使っている'))
    const voteButton = screen.getByText('投票する')
    expect(voteButton).not.toBeDisabled()
  })

  test('vote button is disabled when nothing selected', () => {
    render(
      <PollOverlay poll={mockPoll} onVote={mockOnVote} onDismiss={mockOnDismiss} />
    )
    const voteButton = screen.getByText('投票する')
    expect(voteButton).toBeDisabled()
  })

  test('single select: selecting another option deselects first', () => {
    render(
      <PollOverlay poll={mockPoll} onVote={mockOnVote} onDismiss={mockOnDismiss} />
    )
    fireEvent.click(screen.getByText('AIを既に使っている'))
    fireEvent.click(screen.getByText('まだ使っていない'))

    // Vote and check which option was submitted
    fireEvent.click(screen.getByText('投票する'))
    expect(mockOnVote).toHaveBeenCalledWith('poll-test', ['opt_b'])
  })

  test('toggling a selected option deselects it', () => {
    render(
      <PollOverlay poll={mockPoll} onVote={mockOnVote} onDismiss={mockOnDismiss} />
    )
    fireEvent.click(screen.getByText('AIを既に使っている'))
    fireEvent.click(screen.getByText('AIを既に使っている')) // deselect

    const voteButton = screen.getByText('投票する')
    expect(voteButton).toBeDisabled()
  })
})

// ========================
// Multiple select
// ========================

describe('PollOverlay - multiple select', () => {
  const multiPoll: Poll = { ...mockPoll, id: 'poll-multi', allowMultiple: true }

  test('allows selecting multiple options', () => {
    render(
      <PollOverlay poll={multiPoll} onVote={mockOnVote} onDismiss={mockOnDismiss} />
    )
    fireEvent.click(screen.getByText('AIを既に使っている'))
    fireEvent.click(screen.getByText('検討中'))
    fireEvent.click(screen.getByText('投票する'))

    const call = mockOnVote.mock.calls[0] as [string, string[]]
    expect(call[1]).toContain('opt_a')
    expect(call[1]).toContain('opt_c')
  })
})

// ========================
// Voting
// ========================

describe('PollOverlay - voting', () => {
  test('calls onVote with poll id and selected option', () => {
    render(
      <PollOverlay poll={mockPoll} onVote={mockOnVote} onDismiss={mockOnDismiss} />
    )
    fireEvent.click(screen.getByText('AIを既に使っている'))
    fireEvent.click(screen.getByText('投票する'))

    expect(mockOnVote).toHaveBeenCalledWith('poll-test', ['opt_a'])
  })

  test('shows results after voting when showResultsAfterVote is true', () => {
    render(
      <PollOverlay poll={mockPoll} onVote={mockOnVote} onDismiss={mockOnDismiss} />
    )
    fireEvent.click(screen.getByText('AIを既に使っている'))
    fireEvent.click(screen.getByText('投票する'))

    expect(screen.getByText('回答ありがとうございます')).toBeInTheDocument()
  })

  test('hides vote button after voting', () => {
    render(
      <PollOverlay poll={mockPoll} onVote={mockOnVote} onDismiss={mockOnDismiss} />
    )
    fireEvent.click(screen.getByText('AIを既に使っている'))
    fireEvent.click(screen.getByText('投票する'))

    expect(screen.queryByText('投票する')).not.toBeInTheDocument()
  })

  test('cannot vote after already voted', () => {
    render(
      <PollOverlay poll={mockPoll} onVote={mockOnVote} onDismiss={mockOnDismiss} />
    )
    fireEvent.click(screen.getByText('AIを既に使っている'))
    fireEvent.click(screen.getByText('投票する'))
    fireEvent.click(screen.getByText('AIを既に使っている')) // attempt re-click

    expect(mockOnVote).toHaveBeenCalledTimes(1)
  })
})

// ========================
// Dismiss
// ========================

describe('PollOverlay - dismiss', () => {
  test('calls onDismiss with poll id when close button clicked', () => {
    render(
      <PollOverlay poll={mockPoll} onVote={mockOnVote} onDismiss={mockOnDismiss} />
    )
    fireEvent.click(screen.getByLabelText('閉じる'))
    expect(mockOnDismiss).toHaveBeenCalledWith('poll-test')
  })
})

// ========================
// External results
// ========================

describe('PollOverlay - external results', () => {
  test('uses external results when provided after vote', () => {
    const externalResults = {
      pollId: 'poll-test',
      totalVotes: 100,
      voteCounts: { opt_a: 60, opt_b: 30, opt_c: 10 },
      percentages: { opt_a: 60, opt_b: 30, opt_c: 10 },
    }

    render(
      <PollOverlay
        poll={mockPoll}
        onVote={mockOnVote}
        onDismiss={mockOnDismiss}
        externalResults={externalResults}
      />
    )
    fireEvent.click(screen.getByText('AIを既に使っている'))
    fireEvent.click(screen.getByText('投票する'))

    // Should show 60% for opt_a based on external results
    expect(screen.getByText('60%')).toBeInTheDocument()
  })
})
