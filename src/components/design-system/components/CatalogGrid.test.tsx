// @vitest-environment jsdom
import { screen, within } from '@testing-library/react'
import { renderWithRouter } from '@/test/render'
import { Route, Routes } from 'react-router-dom'
import BrowseTile from './BrowseTile'
import {
  CatalogGrid,
  CatalogGroup,
  CatalogGroupedResults,
} from './CatalogGrid'

function setup(ui: React.ReactNode) {
  return renderWithRouter(
    <Routes>
      <Route path="/" element={ui} />
    </Routes>,
  )
}

describe('CatalogGrid — responsive grid wrapper for BrowseTiles', () => {
  it('renders its children inside a grid container', () => {
    setup(
      <CatalogGrid>
        <BrowseTile to="/a">A</BrowseTile>
        <BrowseTile to="/b">B</BrowseTile>
      </CatalogGrid>,
    )
    expect(screen.getByRole('link', { name: 'A' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'B' })).toBeInTheDocument()
  })
})

describe('CatalogGroup — labeled group with h2 heading', () => {
  it('renders the heading as an h2', () => {
    setup(
      <CatalogGroup heading="Digestive">
        <CatalogGrid>
          <BrowseTile to="/x">X</BrowseTile>
        </CatalogGrid>
      </CatalogGroup>,
    )
    expect(
      screen.getByRole('heading', { level: 2, name: /digestive/i }),
    ).toBeInTheDocument()
  })

  it('renders its children inside the group', () => {
    setup(
      <CatalogGroup heading="Digestive">
        <CatalogGrid>
          <BrowseTile to="/x">X</BrowseTile>
        </CatalogGrid>
      </CatalogGroup>,
    )
    expect(screen.getByRole('link', { name: 'X' })).toBeInTheDocument()
  })
})

describe('CatalogGroupedResults — stack of CatalogGroups', () => {
  it('renders every child group in order', () => {
    setup(
      <CatalogGroupedResults>
        <CatalogGroup heading="Digestive">
          <CatalogGrid>
            <BrowseTile to="/d1">D1</BrowseTile>
          </CatalogGrid>
        </CatalogGroup>
        <CatalogGroup heading="Respiratory">
          <CatalogGrid>
            <BrowseTile to="/r1">R1</BrowseTile>
          </CatalogGrid>
        </CatalogGroup>
      </CatalogGroupedResults>,
    )

    const headings = screen.getAllByRole('heading', { level: 2 })
    expect(headings.map((h) => h.textContent)).toEqual([
      'Digestive',
      'Respiratory',
    ])
    expect(screen.getByRole('link', { name: 'D1' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'R1' })).toBeInTheDocument()
  })

  it('keeps each group section scoped to its own children', () => {
    setup(
      <CatalogGroupedResults>
        <CatalogGroup heading="Digestive">
          <CatalogGrid>
            <BrowseTile to="/d1">D1</BrowseTile>
          </CatalogGrid>
        </CatalogGroup>
        <CatalogGroup heading="Respiratory">
          <CatalogGrid>
            <BrowseTile to="/r1">R1</BrowseTile>
          </CatalogGrid>
        </CatalogGroup>
      </CatalogGroupedResults>,
    )

    const digestive = screen
      .getByRole('heading', { level: 2, name: /digestive/i })
      .closest('section') as HTMLElement
    if (!digestive) throw new Error('expected digestive group <section>')
    expect(within(digestive).getByRole('link', { name: 'D1' })).toBeInTheDocument()
    expect(within(digestive).queryByRole('link', { name: 'R1' })).toBeNull()
  })
})
