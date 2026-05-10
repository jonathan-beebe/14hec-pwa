import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/design-system/atoms/Button'

/**
 * Mobile-only top bar (`lg:hidden`) that hosts the hamburger toggle, the
 * page title, and an optional back button. The bar shell lives in the
 * Layout; pages and layout primitives contribute via `usePageMeta`.
 *
 * Multiple registrations coexist via a stack: each component that calls
 * `usePageMeta` owns a slot keyed by `useId`. The bar renders the merged
 * state where later registrations override earlier ones, but `undefined`
 * fields don't override. So a parent can set `back` and a deeper child
 * can set `title` and both apply.
 */

export interface PageMeta {
  /** Bar title for this page. Defaults to the app name when unset. */
  title?: string
  /**
   * Path to navigate to when the user taps the back button. When set,
   * the bar shows ← in place of the hamburger. `null` explicitly clears
   * a back set by an outer component; `undefined` leaves it untouched.
   */
  back?: string | null
}

interface RegistryEntry extends PageMeta {
  id: string
}

interface PageMetaRegistry {
  register: (entry: RegistryEntry) => void
  unregister: (id: string) => void
}

const PageMetaRegistryContext = createContext<PageMetaRegistry | null>(null)
const PageMetaStateContext = createContext<PageMeta>({})

export function MobileTopBarProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<RegistryEntry[]>([])

  const register = useCallback((entry: RegistryEntry) => {
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.id !== entry.id)
      return [...filtered, entry]
    })
  }, [])

  const unregister = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const meta = useMemo<PageMeta>(() => {
    const merged: PageMeta = {}
    for (const entry of entries) {
      if (entry.title !== undefined) merged.title = entry.title
      if (entry.back !== undefined) merged.back = entry.back
    }
    return merged
  }, [entries])

  const registry = useMemo<PageMetaRegistry>(() => ({ register, unregister }), [register, unregister])

  return (
    <PageMetaRegistryContext.Provider value={registry}>
      <PageMetaStateContext.Provider value={meta}>
        {children}
      </PageMetaStateContext.Provider>
    </PageMetaRegistryContext.Provider>
  )
}

/**
 * Page-side hook. Call from any route component (or layout primitive)
 * to contribute to the mobile top bar.
 *
 * Each call owns its own slot — calls from different components do not
 * trample each other. Within the merged result, `undefined` fields are
 * skipped, so a parent setting only `back` and a child setting only
 * `title` will both appear.
 *
 * @example
 *   usePageMeta({ title: 'Plants' })
 *   usePageMeta({ title: plant.name, back: '/plants' })
 */
export function usePageMeta({ title, back }: PageMeta) {
  const registry = useContext(PageMetaRegistryContext)
  const id = useId()

  useEffect(() => {
    if (!registry) return
    registry.register({ id, title, back })
    return () => registry.unregister(id)
  }, [registry, id, title, back])
}

export function useMobileTopBarState(): PageMeta {
  return useContext(PageMetaStateContext)
}

interface MobileTopBarProps {
  navOpen: boolean
  onMenuClick: () => void
  /** id used by aria-controls on the hamburger button. */
  drawerId: string
}

/**
 * The mobile top bar. Sticky at the top of the page on `< lg` viewports;
 * hidden on `lg+` where the desktop sidebar is always visible.
 */
export default function MobileTopBar({ navOpen, onMenuClick, drawerId }: MobileTopBarProps) {
  const { title, back } = useMobileTopBarState()
  const navigate = useNavigate()

  return (
    <div
      className="lg:hidden sticky top-0 z-20 h-12 relative flex items-center"
      style={{
        background: 'rgba(16, 15, 12, 0.82)',
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Left slot — absolute so its width doesn't shift the centered
          title when the label changes between hamburger and "‹ Back". */}
      <div className="absolute left-2 top-0 bottom-0 flex items-center">
        {back ? (
          <Button.Ghost
            onClick={() => navigate(back)}
            aria-label="Back"
            className="!px-2 flex items-center gap-1 font-system"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.25}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polyline points="15 6 9 12 15 18" />
            </svg>
            <span>Back</span>
          </Button.Ghost>
        ) : (
          <Button.Ghost
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            aria-expanded={navOpen}
            aria-controls={drawerId}
            className="!px-2 font-system"
          >
            <span className="text-xl leading-none">☰</span>
          </Button.Ghost>
        )}
      </div>

      <h1 className="w-full text-center text-sm font-display tracking-wider text-earth-100 truncate px-20">
        {title ?? '14 HEC'}
      </h1>

      {/* Right slot — reserved for future actions (filter, search, etc.). */}
      <div className="absolute right-2 top-0 bottom-0 flex items-center" />
    </div>
  )
}
