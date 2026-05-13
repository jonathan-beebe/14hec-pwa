import { render, screen } from '@testing-library/react'
import Notice from './Notice'

describe('Notice — supplementary advisory callout', () => {
  it('renders body content', () => {
    render(<Notice>Be careful out there.</Notice>)
    expect(screen.getByText('Be careful out there.')).toBeInTheDocument()
  })

  it('renders the title when provided', () => {
    render(<Notice title="Sacred Responsibility">Body copy.</Notice>)
    expect(screen.getByText('Sacred Responsibility')).toBeInTheDocument()
  })

  it('is announced as a note region (role="note") for assistive tech', () => {
    render(<Notice title="Safety notes">Read carefully.</Notice>)
    expect(screen.getByRole('note')).toBeInTheDocument()
  })

  it('renders a default warning icon for tone="caution" (the default)', () => {
    const { container } = render(<Notice title="Heads up">Body.</Notice>)
    // Default caution glyph is "⚠".
    expect(container.textContent).toContain('⚠')
  })

  it('accepts a custom icon that overrides the default glyph', () => {
    render(
      <Notice icon={<span data-testid="custom-icon">★</span>}>
        Body.
      </Notice>,
    )
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('applies the info tone treatment when tone="info"', () => {
    const { container } = render(
      <Notice tone="info" title="FYI">
        Body.
      </Notice>,
    )
    // Info uses a blue accent; assert by class presence on the panel.
    const aside = screen.getByRole('note')
    expect(aside.className).toContain('blue-500')
    // Default info glyph differs from caution.
    expect(container.textContent).toContain('ⓘ')
  })
})
