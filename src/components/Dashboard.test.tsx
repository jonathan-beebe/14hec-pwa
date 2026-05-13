import { describe, it, expect } from 'vitest'
import { Routes, Route } from 'react-router-dom'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '@/test/render'
import Dashboard from './Dashboard'
import PreparationList from './preparations/PreparationList'

describe('Dashboard navigation', () => {
  it('navigates to the preparations view when the Preparations card is clicked', async () => {
    const user = userEvent.setup()

    renderWithRouter(
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/preparations" element={<PreparationList />} />
      </Routes>,
    )

    const link = await screen.findByRole('link', { name: /preparations/i })
    expect(link).toHaveAttribute('href', '/preparations')

    await user.click(link)

    expect(
      await screen.findByRole('heading', { name: /preparation methods/i }),
    ).toBeInTheDocument()
  })
})
