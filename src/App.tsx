import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/layout/Layout'
import PageGutter from './components/layout/PageGutter'
import Dashboard from './components/Dashboard'
import PlantList from './components/plants/PlantList'
import PlantDetail from './components/plants/PlantDetail'
import AilmentNavigator from './components/ailments/AilmentNavigator'
import AilmentDetail from './components/ailments/AilmentDetail'
import AstrologyShell from './components/astrology/AstrologyShell'
import SignsView, { SignDetailView } from './components/astrology/SignsView'
import PlanetsView, { PlanetDetailView } from './components/astrology/PlanetsView'
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
import BodySystemsList from './components/bodysystems/BodySystemsList'
import BodySystemsDetail from './components/bodysystems/BodySystemsDetail'
import JournalList from './components/journal/JournalList'
import JournalView from './components/journal/JournalView'
import CollectionsList from './components/collections/CollectionsList'
import CollectionsView from './components/collections/CollectionsView'
import WellnessNavigator from './components/wellness/WellnessNavigator'
import WellnessDetail from './components/wellness/WellnessDetail'
import DisclaimerModal from './components/common/DisclaimerModal'
import UpdateBanner from './components/common/UpdateBanner'
import DesignSystem from './components/design-system/DesignSystem'
import ListDetailDemo, { ListDetailDemoDetail } from './components/design-system/layouts/demos/ListDetailDemo'
import CatalogDemo, { CatalogDemoDetail } from './components/design-system/layouts/demos/CatalogDemo'
import CatalogGroupedDemo from './components/design-system/layouts/demos/CatalogGroupedDemo'
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
            <Route path=":id" element={<ListDetailDemoDetail />} />
          </Route>
          <Route path="/design-system/layouts/catalog" element={<CatalogDemo />} />
          <Route path="/design-system/layouts/catalog/:id" element={<CatalogDemoDetail />} />
          <Route path="/design-system/layouts/catalog-grouped" element={<CatalogGroupedDemo />} />
          <Route path="/ailments" element={<AilmentNavigator />} />
          <Route path="/plants" element={<PlantList />} />
          <Route path="/body-systems" element={<BodySystemsList />} />
          <Route path="/collections" element={<CollectionsList />} />
          <Route path="/journal" element={<JournalList />} />
          <Route path="/entheogens" element={<EntheogenicGuide />}>
            <Route path="plants/:id" element={<EntheogenicPlantDetail />} />
            <Route path="protocols/:slug" element={<EntheogenicProtocolDetail />} />
          </Route>
          <Route path="/astrology" element={<AstrologyShell />}>
            <Route index element={<Navigate to="/astrology/signs" replace />} />
            <Route path="signs" element={<SignsView />}>
              <Route path=":slug" element={<SignDetailView />} />
            </Route>
            <Route path="planets" element={<PlanetsView />}>
              <Route path=":slug" element={<PlanetDetailView />} />
            </Route>
          </Route>

          {/* Standard pages — wrapped in the page gutter */}
          <Route element={<PageGutter />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/plants/:id" element={<PlantDetail />} />
            <Route path="/ailments/:id" element={<AilmentDetail />} />
            <Route path="/astrology/natal-chart" element={<NatalInput />} />
            <Route path="/astrology/planetary-timing" element={<PlanetaryTiming />} />
            <Route path="/preparations" element={<PreparationMatrix />} />
            <Route path="/crossref" element={<CrossReference />} />
            <Route path="/hmbs" element={<HMBSView />} />
            <Route path="/seasonal" element={<SeasonalGuide />} />
            <Route path="/doctrine" element={<DoctrineExplorer />} />
            <Route path="/body-systems/:id" element={<BodySystemsDetail />} />
            <Route path="/journal/new" element={<JournalView />} />
            <Route path="/journal/:id" element={<JournalView />} />
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
