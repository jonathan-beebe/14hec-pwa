import { useEffect, useState } from 'react'

/**
 * Track `prefers-reduced-motion: reduce`. Returns true when the user has
 * asked the OS to reduce motion. Re-renders if the preference changes
 * mid-session.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false
    return matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}
