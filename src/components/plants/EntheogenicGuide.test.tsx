import { describe, it, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { renderWithRouter } from '@/test/render'
import { api } from '@/data/api'
import EntheogenicGuide from './EntheogenicGuide'
import EntheogenicPlantDetail from './EntheogenicPlantDetail'
import EntheogenicProtocolDetail from './EntheogenicProtocolDetail'
import { INTEGRATION_PROTOCOLS } from './entheogenicProtocols'

function renderEntheogenicRoutes(initialEntry: string) {
  return renderWithRouter(
    <Routes>
      <Route path="/entheogens" element={<EntheogenicGuide />}>
        <Route path="plants/:id" element={<EntheogenicPlantDetail />} />
        <Route path="protocols/:slug" element={<EntheogenicProtocolDetail />} />
      </Route>
    </Routes>,
    { initialEntries: [initialEntry] },
  )
}

describe('EntheogenicGuide', () => {
  it('shows the empty state on the index route and swaps to plant detail when a plant link is clicked', async () => {
    const entheogenicPlants = await api.getPlants({ category: 'entheogenic' })
    const [plant] = entheogenicPlants
    if (!plant) throw new Error('expected at least one entheogenic plant in seed data')

    const user = userEvent.setup()
    renderEntheogenicRoutes('/entheogens')

    expect(
      await screen.findByText(/select a plant or protocol/i),
    ).toBeInTheDocument()

    const plantLink = await screen.findByRole('link', {
      name: new RegExp(plant.common_name, 'i'),
    })
    await user.click(plantLink)

    expect(
      await screen.findByRole('heading', { name: plant.common_name, level: 2 }),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/select a plant or protocol/i),
    ).not.toBeInTheDocument()
  })

  it('renders plant detail when deep-linked to /entheogens/plants/:id', async () => {
    const entheogenicPlants = await api.getPlants({ category: 'entheogenic' })
    const [plant] = entheogenicPlants
    if (!plant) throw new Error('expected at least one entheogenic plant in seed data')

    renderEntheogenicRoutes(`/entheogens/plants/${plant.id}`)

    const detailHeading = await screen.findByRole('heading', {
      name: plant.common_name,
      level: 2,
    })
    const detailHeader = detailHeading.parentElement
    if (!detailHeader) throw new Error('expected detail heading to have a parent container')
    expect(within(detailHeader).getByText(plant.latin_name)).toBeInTheDocument()
  })

  it('renders the journey protocol when a protocol link is clicked', async () => {
    const protocol = INTEGRATION_PROTOCOLS[0]
    if (!protocol) throw new Error('expected at least one integration protocol')
    const firstPhase = protocol.phases[0]
    if (!firstPhase) throw new Error('expected protocol to have at least one phase')

    const user = userEvent.setup()
    renderEntheogenicRoutes('/entheogens')

    const protocolLink = await screen.findByRole('link', {
      name: new RegExp(protocol.name, 'i'),
    })
    await user.click(protocolLink)

    expect(
      await screen.findByRole('heading', { name: protocol.name, level: 2 }),
    ).toBeInTheDocument()
    expect(screen.getByText(firstPhase.guidance)).toBeInTheDocument()
  })
})
