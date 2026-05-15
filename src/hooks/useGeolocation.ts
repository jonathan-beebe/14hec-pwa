import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = '14hec-geo-location'

export type GeoState =
  | { status: 'idle' }
  | { status: 'requesting' }
  | { status: 'resolved'; latitude: number; longitude: number }
  | { status: 'denied' }
  | { status: 'unavailable' }

function readCache(): { latitude: number; longitude: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
      return parsed
    }
  } catch {
    // corrupt cache — ignore
  }
  return null
}

export function useGeolocation() {
  const [geo, setGeo] = useState<GeoState>(() => {
    const cached = readCache()
    if (cached) return { status: 'resolved', ...cached }
    return { status: 'idle' }
  })

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeo({ status: 'unavailable' })
      return
    }
    setGeo({ status: 'requesting' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(coords))
        setGeo({ status: 'resolved', ...coords })
      },
      (err) => {
        setGeo(err.code === 1 ? { status: 'denied' } : { status: 'unavailable' })
      },
      { timeout: 10000 },
    )
  }, [])

  useEffect(() => {
    if (geo.status === 'idle' && !navigator.geolocation) {
      setGeo({ status: 'unavailable' })
    }
  }, [geo.status])

  return { geo, requestLocation }
}
