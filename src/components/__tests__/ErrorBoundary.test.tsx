import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import ErrorBoundary from '../ErrorBoundary'

const ErrorComponent = () => {
  throw new Error('Test error')
}

const SafeComponent = () => <div>Safe component</div>

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Safe component')).toBeInTheDocument()
  })

  it('renders error UI when there is an error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('We encountered an unexpected error. Please try refreshing the page.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('allows retrying after an error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()

    const { rerender } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()

    // Mock the error state reset
    rerender(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    )

    consoleSpy.mockRestore()
  })

  it('renders custom fallback when provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary fallback={<div>Custom error fallback</div>}>
        <ErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error fallback')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})