// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { Routes, Route } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '@/test/render'
import Dashboard from './Dashboard'

function PreparationsStub() {
  return <h1>Preparation Methods</h1>
}

describe('Dashboard navigation', () => {
  it('navigates to the preparations view when the Preparations card is clicked', async () => {
    const user = userEvent.setup()

    renderWithRouter(
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/preparations" element={<PreparationsStub />} />
      </Routes>,
    )

    const link = await screen.findByRole('link', { name: /preparations/i })
    expect(link).toHaveAttribute('href', '/preparations')

    await user.click(link)

    expect(
      await screen.findByRole('heading', { name: /preparation methods/i }),
    ).toBeInTheDocument()
  })

  it('renders quick-access plant items as links with proper hrefs', async () => {
    renderWithRouter(
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>,
    )

    await waitFor(() => {
      const allLinks = screen.getAllByRole('link')
      const plantLink = allLinks.find((link) => link.getAttribute('href')?.startsWith('/plants/'))
      expect(plantLink).toBeDefined()
      if (!plantLink) throw new Error('No plant link found')
      expect(plantLink.getAttribute('href')).toMatch(/^\/plants\/\d+$/)
    })
  })

  it('renders quick-access ailment items as links with proper hrefs', async () => {
    renderWithRouter(
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>,
    )

    await waitFor(() => {
      const allLinks = screen.getAllByRole('link')
      const ailmentLink = allLinks.find((link) => link.getAttribute('href')?.startsWith('/ailments/'))
      expect(ailmentLink).toBeDefined()
      if (!ailmentLink) throw new Error('No ailment link found')
      expect(ailmentLink.getAttribute('href')).toMatch(/^\/ailments\/\d+$/)
    })
  })
})
