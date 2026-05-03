import { describe, it, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '@/test/render'
import { api } from '@/data/api'
import EntheogenicGuide from './EntheogenicGuide'

describe('EntheogenicGuide', () => {
  it('renders the selected plant in the detail panel when its list button is clicked', async () => {
    const entheogenicPlants = await api.getPlants({ category: 'entheogenic' })
    const [plant] = entheogenicPlants
    if (!plant) throw new Error('expected at least one entheogenic plant in seed data')

    const user = userEvent.setup()

    renderWithRouter(<EntheogenicGuide />, { initialEntries: ['/entheogens'] })

    expect(
      await screen.findByText(/select a plant or protocol/i),
    ).toBeInTheDocument()

    const plantButton = await screen.findByRole('button', {
      name: new RegExp(plant.common_name, 'i'),
    })

    await user.click(plantButton)

    const detailHeading = await screen.findByRole('heading', {
      name: plant.common_name,
    })
    const detailHeader = detailHeading.parentElement
    if (!detailHeader) throw new Error('expected detail heading to have a parent container')

    expect(within(detailHeader).getByText(plant.latin_name)).toBeInTheDocument()
    expect(
      screen.queryByText(/select a plant or protocol/i),
    ).not.toBeInTheDocument()
  })
})
