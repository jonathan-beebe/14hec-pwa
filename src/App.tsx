import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/layout/Layout'
import PageGutter from './components/layout/PageGutter'
import Dashboard from './components/Dashboard'
import PlantList from './components/plants/PlantList'
import PlantDetail from './components/plants/PlantDetail'
import AilmentNavigator from './components/ailments/AilmentNavigator'
import AilmentDetail from './components/ailments/AilmentDetail'
import AstrologyView from './components/astrology/AstrologyView'
import NatalInput from './components/astrology/NatalInput'
import PlanetaryTiming from './components/astrology/PlanetaryTiming'
import PreparationMatrix from './components/preparations/PreparationMatrix'
import CrossReference from './components/crossref/CrossReference'
import EntheogenicGuide from './components/plants/EntheogenicGuide'
import EntheogenicPlantDetail from './components/plants/EntheogenicPlantDetail'
import EntheogenicProtocolDetail from './components/plants/EntheogenicProtocolDetail'
import HMBSView from './components/sanctuary/HMBSView'
import SeasonalGuide from './components/sanctuary/SeasonalGuide'
import DoctrineExplorer from './components/sanctuary/DoctrineExplorer'
import BodySystemsView from './components/bodysystems/BodySystemsView'
import JournalView from './components/journal/JournalView'
import CollectionsView from './components/collections/CollectionsView'
import WellnessNavigator from './components/wellness/WellnessNavigator'
import WellnessDetail from './components/wellness/WellnessDetail'
import DisclaimerModal from './components/common/DisclaimerModal'
import UpdateBanner from './components/common/UpdateBanner'
import DesignSystem from './components/design-system/DesignSystem'
import ListDetailDemo, { ListDetailDemoDetail } from './components/design-system/layouts/demos/ListDetailDemo'
import CatalogDemo, { CatalogDemoDetail } from './components/design-system/layouts/demos/CatalogDemo'
import PlanetsSpike from './components/spike/PlanetsSpike'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const [showDisclaimer, setShowDisclaimer] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('14hec-disclaimer-accepted')
    if (!accepted) {
      setShowDisclaimer(true)
    }
  }, [])

  const acceptDisclaimer = () => {
    localStorage.setItem('14hec-disclaimer-accepted', 'true')
    setShowDisclaimer(false)
  }

  return (
    <>
      <ScrollToTop />
      <UpdateBanner />
      {showDisclaimer && <DisclaimerModal onAccept={acceptDisclaimer} />}
      <Routes>
        <Route element={<Layout />}>
          {/* Canonical viewport-owning layouts — no page gutter */}
          <Route path="/design-system/layouts/list-detail" element={<ListDetailDemo />}>
            <Route index element={null} />
            <Route path=":id" element={<ListDetailDemoDetail />} />
          </Route>
          <Route path="/design-system/layouts/catalog" element={<CatalogDemo />} />
          <Route path="/design-system/layouts/catalog/:id" element={<CatalogDemoDetail />} />
          <Route path="/entheogens" element={<EntheogenicGuide />}>
            <Route path="plants/:id" element={<EntheogenicPlantDetail />} />
            <Route path="protocols/:slug" element={<EntheogenicProtocolDetail />} />
          </Route>

          {/* Standard pages — wrapped in the page gutter */}
          <Route element={<PageGutter />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/plants" element={<PlantList />} />
            <Route path="/plants/:id" element={<PlantDetail />} />
            <Route path="/ailments" element={<AilmentNavigator />} />
            <Route path="/ailments/:id" element={<AilmentDetail />} />
            <Route path="/astrology" element={<AstrologyView />} />
            <Route path="/natal-chart" element={<NatalInput />} />
            <Route path="/planetary-timing" element={<PlanetaryTiming />} />
            <Route path="/preparations" element={<PreparationMatrix />} />
            <Route path="/crossref" element={<CrossReference />} />
            <Route path="/hmbs" element={<HMBSView />} />
            <Route path="/seasonal" element={<SeasonalGuide />} />
            <Route path="/doctrine" element={<DoctrineExplorer />} />
            <Route path="/body-systems" element={<BodySystemsView />} />
            <Route path="/body-systems/:id" element={<BodySystemsView />} />
            <Route path="/journal" element={<JournalView />} />
            <Route path="/collections" element={<CollectionsView />} />
            <Route path="/collections/new" element={<CollectionsView />} />
            <Route path="/collections/:id" element={<CollectionsView />} />
            <Route path="/collections/:id/edit" element={<CollectionsView />} />
            <Route path="/wellness" element={<WellnessNavigator />} />
            <Route path="/wellness/:id" element={<WellnessDetail />} />
            <Route path="/design-system" element={<DesignSystem />} />
            <Route path="/spike/planets" element={<PlanetsSpike />} />
            <Route path="/spike/planets/:planetName" element={<PlanetsSpike />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}
