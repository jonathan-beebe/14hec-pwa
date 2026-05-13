import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CatalogEmpty from './CatalogEmpty'

describe('CatalogEmpty — zero-state panel for the CatalogLayout empty slot', () => {
  it('renders the message text', () => {
    render(<CatalogEmpty message="No plants match your filters." />)
    expect(
      screen.getByText('No plants match your filters.'),
    ).toBeInTheDocument()
  })

  it('renders the optional icon when provided', () => {
    render(
      <CatalogEmpty
        message="No plants match."
        icon={<span data-testid="icon">{'☘'}</span>}
      />,
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders a Clear filters button when onClear is provided', async () => {
    const onClear = vi.fn()
    const user = userEvent.setup()
    render(<CatalogEmpty message="No plants match." onClear={onClear} />)

    const button = screen.getByRole('button', { name: /clear filters/i })
    await user.click(button)
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('omits the Clear button when onClear is not provided', () => {
    render(<CatalogEmpty message="Nothing yet." />)
    expect(screen.queryByRole('button', { name: /clear/i })).toBeNull()
  })

  it('renders custom actions alongside or instead of Clear', () => {
    render(
      <CatalogEmpty
        message="No collections yet."
        actions={<button type="button">Create one</button>}
      />,
    )
    expect(
      screen.getByRole('button', { name: 'Create one' }),
    ).toBeInTheDocument()
  })
})
