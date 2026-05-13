import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import SearchInput from './SearchInput'

function Controlled({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial)
  return (
    <SearchInput
      value={value}
      onChange={setValue}
      aria-label="Search plants"
      placeholder="Search by name…"
    />
  )
}

describe('SearchInput', () => {
  it('renders a search-typed input named by aria-label', () => {
    render(<Controlled />)
    const input = screen.getByRole('searchbox', { name: 'Search plants' })
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'search')
  })

  it('shows the placeholder', () => {
    render(<Controlled />)
    expect(screen.getByRole('searchbox')).toHaveAttribute(
      'placeholder',
      'Search by name…',
    )
  })

  it('reflects the controlled value', () => {
    render(<Controlled initial="yarrow" />)
    expect(screen.getByRole('searchbox')).toHaveValue('yarrow')
  })

  it('fires onChange with the new string value on each keystroke', async () => {
    const user = userEvent.setup()
    render(<Controlled />)
    const input = screen.getByRole('searchbox')

    await user.type(input, 'rose')

    expect(input).toHaveValue('rose')
  })

  it('renders a leading search icon marked as decorative', () => {
    const { container } = render(<Controlled />)
    // Icon is decorative — should not surface in the accessibility tree.
    // We assert via DOM presence + aria-hidden, since the wrapping span
    // is intentionally opaque to screen readers.
    const icon = container.querySelector('[data-search-icon]')
    expect(icon).not.toBeNull()
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('forwards the ref to the underlying input', () => {
    let captured: HTMLInputElement | null = null
    render(
      <SearchInput
        value=""
        onChange={() => {}}
        aria-label="Search"
        ref={(node) => {
          captured = node
        }}
      />,
    )
    expect(captured).not.toBeNull()
    if (!captured) throw new Error('ref did not capture input element')
    expect((captured as HTMLInputElement).tagName).toBe('INPUT')
  })
})
