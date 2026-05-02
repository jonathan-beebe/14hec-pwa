import { useRegisterSW } from 'virtual:pwa-register/react'

export default function UpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-4 px-4 py-2 text-sm"
         style={{
           background: 'linear-gradient(135deg, rgba(45, 112, 72, 0.95), rgba(35, 90, 58, 0.95))',
           backdropFilter: 'blur(12px)',
           borderBottom: '1px solid rgba(93, 168, 126, 0.3)'
         }}>
      <span className="text-earth-100">A new version is available</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="px-3 py-1 rounded-lg text-xs font-medium text-white transition-all duration-150"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        Update
      </button>
      <button
        onClick={() => setNeedRefresh(false)}
        className="px-3 py-1 rounded-lg text-xs font-medium text-earth-300 hover:text-earth-100 transition-colors duration-150"
      >
        Dismiss
      </button>
    </div>
  )
}
