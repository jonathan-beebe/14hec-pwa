// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { List, ListItem } from './List'

interface TestItem {
  id: number
  to: string
  label: string
}

function TestRow(item: TestItem) {
  return <ListItem to={item.to}>{item.label}</ListItem>
}

describe('List', () => {
  it('renders all items using the renderItem function', () => {
    const items: TestItem[] = [
      { id: 1, to: '/a', label: 'Alpha' },
      { id: 2, to: '/b', label: 'Beta' },
    ]

    render(
      <MemoryRouter>
        <List items={items} renderItem={TestRow} />
      </MemoryRouter>
    )

    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('renders links with correct href', () => {
    const items: TestItem[] = [
      { id: 1, to: '/plants/42', label: 'Yarrow' },
    ]

    render(
      <MemoryRouter>
        <List items={items} renderItem={TestRow} />
      </MemoryRouter>
    )

    const link = screen.getByRole('link', { name: 'Yarrow' })
    expect(link).toHaveAttribute('href', '/plants/42')
  })

  it('renders trailing content in ListItem', () => {
    render(
      <MemoryRouter>
        <ListItem to="/test" trailing={<span data-testid="badge">trail</span>}>
          Content
        </ListItem>
      </MemoryRouter>
    )

    expect(screen.getByTestId('badge')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})
