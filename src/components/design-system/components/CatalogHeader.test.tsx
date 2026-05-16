// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { renderWithRouter } from '@/test/render'
import { Route, Routes } from 'react-router-dom'
import CatalogHeader from './CatalogHeader'

function setup(ui: React.ReactNode) {
  return renderWithRouter(
    <Routes>
      <Route path="/" element={ui} />
    </Routes>,
  )
}

describe('CatalogHeader — canonical page chrome above the filter bar', () => {
  it('renders the title as a top-level heading (h1)', () => {
    setup(<CatalogHeader title="Plants" />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Plants')
  })

  it('renders a single number badge when count equals total', () => {
    setup(<CatalogHeader title="Plants" count={207} total={207} />)
    expect(screen.getByText('207')).toBeInTheDocument()
  })

  it('renders a count-of-total badge when filters have narrowed results', () => {
    setup(<CatalogHeader title="Plants" count={3} total={207} />)
    expect(screen.getByText('3 of 207')).toBeInTheDocument()
  })

  it('omits the badge entirely when count is undefined', () => {
    setup(<CatalogHeader title="Plants" />)
    // No badge text — assert by querying the heading and looking at its parent.
    expect(screen.queryByText(/\d+ of \d+/)).toBeNull()
  })

  it('renders the subtitle when provided', () => {
    setup(
      <CatalogHeader
        title="Plants"
        subtitle="Browse by name, planet, sign, or element."
      />,
    )
    expect(
      screen.getByText('Browse by name, planet, sign, or element.'),
    ).toBeInTheDocument()
  })

  it('renders a back link when backTo is provided', () => {
    setup(
      <CatalogHeader
        title="Catalog Demo"
        backTo={{ to: '/design-system', label: 'Back to catalog' }}
      />,
    )
    const link = screen.getByRole('link', { name: /back to catalog/i })
    expect(link).toHaveAttribute('href', '/design-system')
  })

  it('renders an actions slot when provided', () => {
    setup(
      <CatalogHeader
        title="Collections"
        actions={<button type="button">New</button>}
      />,
    )
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument()
  })
})
