// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import ListDetailEmpty from './ListDetailEmpty'

describe('ListDetailEmpty — zero-state for the ListDetailLayout detail slot', () => {
  it('renders the message text', () => {
    render(<ListDetailEmpty message="Select a planet to view its correspondences." />)
    expect(
      screen.getByText('Select a planet to view its correspondences.'),
    ).toBeInTheDocument()
  })

  it('renders the optional icon when provided', () => {
    render(
      <ListDetailEmpty
        message="Select a sign."
        icon={<span data-testid="icon">{'☉'}</span>}
      />,
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('omits the icon container when no icon is provided', () => {
    const { container } = render(<ListDetailEmpty message="Select an item." />)
    expect(container.querySelector('[aria-hidden]')).toBeNull()
  })

  it('marks string icons as aria-hidden so screen readers skip them', () => {
    const { container } = render(
      <ListDetailEmpty message="Select an item." icon={'☉'} />,
    )
    const hidden = container.querySelector('[aria-hidden]')
    expect(hidden).not.toBeNull()
    expect(hidden?.textContent).toBe('☉')
  })
})
