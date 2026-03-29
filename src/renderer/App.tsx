import { useState, useEffect } from 'react'
import Layout from './components/layout/Layout'
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
import HMBSView from './components/sanctuary/HMBSView'
import SeasonalGuide from './components/sanctuary/SeasonalGuide'
import DoctrineExplorer from './components/sanctuary/DoctrineExplorer'
import BodySystemsView from './components/bodysystems/BodySystemsView'
import JournalView from './components/journal/JournalView'
import CollectionsView from './components/collections/CollectionsView'
import WellnessNavigator from './components/wellness/WellnessNavigator'
import WellnessDetail from './components/wellness/WellnessDetail'
import Dashboard from './components/Dashboard'
import DisclaimerModal from './components/common/DisclaimerModal'

export type Page =
  | { view: 'dashboard' }
  | { view: 'plants' }
  | { view: 'plant-detail'; id: number }
  | { view: 'ailments' }
  | { view: 'ailment-detail'; id: number }
  | { view: 'astrology' }
  | { view: 'natal-chart' }
  | { view: 'planetary-timing' }
  | { view: 'preparations' }
  | { view: 'crossref' }
  | { view: 'entheogenic' }
  | { view: 'hmbs' }
  | { view: 'seasonal' }
  | { view: 'doctrine' }
  | { view: 'body-systems' }
  | { view: 'body-system-detail'; id: number }
  | { view: 'journal' }
  | { view: 'collections' }
  | { view: 'collection-detail'; id: number }
  | { view: 'wellness' }
  | { view: 'wellness-detail'; id: number }

export default function App() {
  const [page, setPage] = useState<Page>({ view: 'dashboard' })
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

  const navigate = (newPage: Page) => setPage(newPage)

  const renderPage = () => {
    switch (page.view) {
      case 'dashboard':
        return <Dashboard navigate={navigate} />
      case 'plants':
        return <PlantList navigate={navigate} />
      case 'plant-detail':
        return <PlantDetail id={page.id} navigate={navigate} />
      case 'ailments':
        return <AilmentNavigator navigate={navigate} />
      case 'ailment-detail':
        return <AilmentDetail id={page.id} navigate={navigate} />
      case 'astrology':
        return <AstrologyView navigate={navigate} />
      case 'natal-chart':
        return <NatalInput navigate={navigate} />
      case 'planetary-timing':
        return <PlanetaryTiming />
      case 'preparations':
        return <PreparationMatrix />
      case 'crossref':
        return <CrossReference navigate={navigate} />
      case 'entheogenic':
        return <EntheogenicGuide navigate={navigate} />
      case 'hmbs':
        return <HMBSView navigate={navigate} />
      case 'seasonal':
        return <SeasonalGuide navigate={navigate} />
      case 'doctrine':
        return <DoctrineExplorer navigate={navigate} />
      case 'body-systems':
        return <BodySystemsView navigate={navigate} />
      case 'body-system-detail':
        return <BodySystemsView id={page.id} navigate={navigate} />
      case 'journal':
        return <JournalView navigate={navigate} />
      case 'collections':
        return <CollectionsView navigate={navigate} />
      case 'collection-detail':
        return <CollectionsView id={page.id} navigate={navigate} />
      case 'wellness':
        return <WellnessNavigator navigate={navigate} />
      case 'wellness-detail':
        return <WellnessDetail id={page.id} navigate={navigate} />
      default:
        return <Dashboard navigate={navigate} />
    }
  }

  return (
    <>
      {showDisclaimer && <DisclaimerModal onAccept={acceptDisclaimer} />}
      <Layout currentView={page.view} navigate={navigate}>
        {renderPage()}
      </Layout>
    </>
  )
}
