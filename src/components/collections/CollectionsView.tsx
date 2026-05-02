import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { api } from '@/data/api'
import type { Collection, CollectionDetail } from '@/types'
import Button from '@/components/design-system/atoms/Button'

type ViewMode = 'list' | 'detail' | 'new' | 'edit'

const COLOR_OPTIONS = [
  { value: 'botanical', label: 'Botanical', bg: 'rgba(74, 222, 128, 0.1)', border: 'rgba(74, 222, 128, 0.15)', text: 'text-botanical-400' },
  { value: 'celestial', label: 'Celestial', bg: 'rgba(124, 94, 237, 0.1)', border: 'rgba(124, 94, 237, 0.15)', text: 'text-celestial-400' },
  { value: 'gold', label: 'Gold', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.15)', text: 'text-gold-400' },
  { value: 'heart', label: 'Heart', bg: 'rgba(244, 63, 94, 0.1)', border: 'rgba(244, 63, 94, 0.15)', text: 'text-rose-400' },
  { value: 'mind', label: 'Mind', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.15)', text: 'text-blue-400' },
] as const

const ICON_OPTIONS = ['\u2618', '\u2661', '\u2B50', '\u2726', '\u2741', '\u2697', '\u2609', '\u2604', '\u2638', '\u263D']

function getColorStyle(color: string) {
  return COLOR_OPTIONS.find(c => c.value === color) || COLOR_OPTIONS[0]
}

export default function CollectionsView() {
  const navigate = useNavigate()
  const { id: idParam } = useParams<{ id?: string }>()
  const { pathname } = useLocation()

  const id = idParam ? Number(idParam) : null
  const viewMode: ViewMode =
    pathname === '/collections/new' ? 'new'
    : pathname.endsWith('/edit') && id !== null ? 'edit'
    : id !== null ? 'detail'
    : 'list'

  const [collections, setCollections] = useState<Collection[]>([])
  const [detail, setDetail] = useState<CollectionDetail | null>(null)
  const [loading, setLoading] = useState(true)

  // Form state
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formIcon, setFormIcon] = useState('\u2618')
  const [formColor, setFormColor] = useState('botanical')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)

  function resetForm() {
    setFormName('')
    setFormDescription('')
    setFormIcon('\u2618')
    setFormColor('botanical')
    setEditingId(null)
  }

  async function loadCollections() {
    setLoading(true)
    try {
      const data = await api.getCollections()
      setCollections(data)
    } catch {
      setCollections([])
    } finally {
      setLoading(false)
    }
  }

  async function loadDetail(collectionId: number) {
    setLoading(true)
    try {
      const data = await api.getCollectionById(collectionId)
      setDetail(data)
    } catch {
      setDetail(null)
    } finally {
      setLoading(false)
    }
  }

  // Sync data with URL-driven view mode
  useEffect(() => {
    if (viewMode === 'list') {
      loadCollections()
    } else if (id !== null && (viewMode === 'detail' || viewMode === 'edit')) {
      loadDetail(id)
    } else if (viewMode === 'new') {
      resetForm()
      setLoading(false)
    }
  }, [viewMode, id])

  // Populate the edit form once detail loads
  useEffect(() => {
    if (viewMode === 'edit' && detail && editingId !== detail.id) {
      setEditingId(detail.id)
      setFormName(detail.name)
      setFormDescription(detail.description || '')
      setFormIcon(detail.icon || '\u2618')
      setFormColor(detail.color || 'botanical')
    }
  }, [viewMode, detail, editingId])

  async function saveCollection() {
    if (!formName.trim()) return
    setSaving(true)
    try {
      const data = {
        name: formName.trim(),
        description: formDescription.trim() || null,
        icon: formIcon,
        color: formColor
      }

      if (viewMode === 'edit' && editingId) {
        await api.updateCollection(editingId, data)
        resetForm()
        navigate(`/collections/${editingId}`)
      } else {
        const result = await api.createCollection(data)
        resetForm()
        navigate(`/collections/${result.id}`)
      }
    } catch (err) {
      console.error('Failed to save collection:', err)
    } finally {
      setSaving(false)
    }
  }

  async function deleteCollection(collId: number) {
    try {
      await api.deleteCollection(collId)
      setShowDeleteConfirm(null)
      setDetail(null)
      navigate('/collections')
    } catch (err) {
      console.error('Failed to delete collection:', err)
    }
  }

  async function removePlant(plantId: number) {
    if (!detail) return
    try {
      await api.removePlantFromCollection(detail.id, plantId)
      await loadDetail(detail.id)
    } catch (err) {
      console.error('Failed to remove plant:', err)
    }
  }

  // ── Render: Collection List ──────────────────────────
  function renderList() {
    return (
      <div className="animate-fade-in">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl opacity-20 mb-4">{'\u2661'}</div>
            <p className="text-earth-400 text-sm mb-2">
              No collections yet
            </p>
            <p className="text-earth-500 text-xs font-display italic">
              Create your first collection to organize plants that matter to you
            </p>
            <Button.Primary route="/collections/new" className="mt-6">
              Create Your First Collection
            </Button.Primary>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {collections.map((collection, i) => {
              const colorStyle = getColorStyle(collection.color)
              return (
                <button
                  key={collection.id}
                  onClick={() => navigate(`/collections/${collection.id}`)}
                  className="text-left cursor-pointer group rounded-2xl p-5 transition-all duration-200 animate-fade-in-up"
                  style={{
                    animationDelay: `${i * 0.04}s`,
                    background: `linear-gradient(135deg, ${colorStyle.bg} 0%, rgba(24, 23, 33, 0.65) 100%)`,
                    border: `1px solid ${colorStyle.border}`,
                    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.03), 0 4px 24px -4px rgba(0, 0, 0, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl opacity-50 group-hover:opacity-80 transition-opacity">
                        {collection.icon || '\u2618'}
                      </span>
                      <div>
                        <h3 className={`text-sm font-display font-semibold ${colorStyle.text} group-hover:opacity-90 transition-opacity`}>
                          {collection.name}
                        </h3>
                        <span className="text-[10px] text-earth-500">
                          {collection.plant_count} {collection.plant_count === 1 ? 'plant' : 'plants'}
                        </span>
                      </div>
                    </div>
                    <span className="text-earth-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      {'\u2192'}
                    </span>
                  </div>
                  {collection.description && (
                    <p className="text-earth-400 text-xs mt-3 leading-relaxed line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── Render: Collection Detail ──────────────────────────
  function renderDetail() {
    if (!detail) return null
    const colorStyle = getColorStyle(detail.color)
    return (
      <div className="animate-fade-in">
        <Button.Ghost route="/collections" className="mb-4 inline-flex items-center gap-1">
          {'\u2190'} All Collections
        </Button.Ghost>

        <div className="rounded-2xl p-6 mb-6"
             style={{
               background: `linear-gradient(135deg, ${colorStyle.bg} 0%, rgba(24, 23, 33, 0.65) 100%)`,
               border: `1px solid ${colorStyle.border}`,
               boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.03), 0 4px 24px -4px rgba(0, 0, 0, 0.3)'
             }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <span className="text-3xl opacity-50">{detail.icon || '\u2618'}</span>
              <div>
                <h2 className={`text-xl font-display font-bold ${colorStyle.text} tracking-wide`}>
                  {detail.name}
                </h2>
                {detail.description && (
                  <p className="text-earth-400 text-sm mt-1">{detail.description}</p>
                )}
                <span className="text-[10px] text-earth-500 mt-1 block">
                  {detail.plants.length} {detail.plants.length === 1 ? 'plant' : 'plants'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button.Ghost route={`/collections/${detail.id}/edit`} className="text-xs">
                Edit
              </Button.Ghost>
              {showDeleteConfirm === detail.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-earth-400">Delete?</span>
                  <button
                    onClick={() => deleteCollection(detail.id)}
                    className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 rounded-lg transition-colors"
                    style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.15)' }}
                  >
                    Yes
                  </button>
                  <Button.Ghost onClick={() => setShowDeleteConfirm(null)} className="text-xs">
                    No
                  </Button.Ghost>
                </div>
              ) : (
                <Button.Ghost
                  onClick={() => setShowDeleteConfirm(detail.id)}
                  className="text-xs text-earth-500 hover:text-red-400"
                >
                  Delete
                </Button.Ghost>
              )}
            </div>
          </div>
        </div>

        {/* Plants in collection */}
        {detail.plants.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-3xl opacity-20 mb-3">{'\u2618'}</div>
            <p className="text-earth-400 text-sm mb-1">This collection is empty</p>
            <p className="text-earth-500 text-xs font-display italic">
              Browse plants and add them to this collection from their detail page
            </p>
            <Button.Primary route="/plants" className="mt-4">
              Browse Plants
            </Button.Primary>
          </div>
        ) : (
          <div className="space-y-2">
            {detail.plants.map((plant, i) => (
              <div
                key={plant.id}
                className="card flex items-center justify-between group animate-fade-in-up"
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <button
                  onClick={() => navigate(`/plants/${plant.id}`)}
                  className="flex-1 text-left flex items-center gap-4 min-w-0"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                       style={{
                         background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.08), rgba(74, 222, 128, 0.02))',
                         border: '1px solid rgba(74, 222, 128, 0.08)'
                       }}>
                    {'\u2618'}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm text-earth-100 group-hover:text-botanical-400 transition-colors block truncate">
                      {plant.common_name}
                    </span>
                    <span className="text-[10px] text-earth-500 italic">{plant.latin_name}</span>
                  </div>
                  <span className={`badge badge-${plant.category} flex-shrink-0`}>{plant.category}</span>
                </button>
                <button
                  onClick={() => removePlant(plant.id)}
                  className="ml-3 text-earth-600 hover:text-red-400 text-xs transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                  title="Remove from collection"
                >
                  {'\u2715'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Render: New/Edit Form ──────────────────────────
  function renderForm() {
    const isEdit = viewMode === 'edit'
    const cancel = () => {
      resetForm()
      if (isEdit && id !== null) {
        navigate(`/collections/${id}`)
      } else {
        navigate('/collections')
      }
    }
    return (
      <div className="animate-fade-in max-w-2xl">
        <Button.Ghost
          onClick={cancel}
          className="mb-4 inline-flex items-center gap-1"
        >
          {'\u2190'} Back
        </Button.Ghost>

        <div className="mb-6">
          <h2 className="text-xl font-display font-bold text-earth-100 tracking-wide">
            {isEdit ? 'Edit Collection' : 'New Collection'}
          </h2>
          <p className="text-earth-500 text-xs mt-1">
            {isEdit ? 'Update your collection details' : 'Group plants that share a purpose, season, or meaning to you'}
          </p>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-[11px] text-earth-500 uppercase tracking-[0.12em] font-medium mb-1.5 block">Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g., Sleep Support, Kitchen Herbs, Spring Garden..."
              className="input-field text-base font-display"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] text-earth-500 uppercase tracking-[0.12em] font-medium mb-1.5 block">Description</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="What unites these plants for you?"
              className="input-field resize-none"
              style={{ minHeight: '100px' }}
            />
          </div>

          {/* Icon */}
          <div>
            <label className="text-[11px] text-earth-500 uppercase tracking-[0.12em] font-medium mb-2 block">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setFormIcon(icon)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-150 ${
                    formIcon === icon ? 'ring-1 ring-botanical-500/30' : ''
                  }`}
                  style={{
                    background: formIcon === icon ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    border: formIcon === icon ? '1px solid rgba(74, 222, 128, 0.2)' : '1px solid rgba(255, 255, 255, 0.04)'
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-[11px] text-earth-500 uppercase tracking-[0.12em] font-medium mb-2 block">Theme</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setFormColor(c.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${c.text} ${
                    formColor === c.value ? 'ring-1' : 'opacity-60 hover:opacity-80'
                  }`}
                  style={{
                    background: c.bg,
                    border: `1px solid ${c.border}`
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="card p-4" style={{ background: 'rgba(24, 23, 33, 0.5)' }}>
            <label className="text-[10px] text-earth-600 uppercase tracking-[0.12em] font-medium mb-2 block">Preview</label>
            <div className="flex items-center gap-3">
              <span className="text-xl opacity-60">{formIcon}</span>
              <div>
                <span className={`text-sm font-display font-semibold ${getColorStyle(formColor).text}`}>
                  {formName || 'Collection Name'}
                </span>
                {formDescription && (
                  <p className="text-earth-500 text-xs mt-0.5">{formDescription}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button.Primary
              onClick={saveCollection}
              disabled={!formName.trim() || saving}
            >
              {saving ? 'Saving...' : isEdit ? 'Update Collection' : 'Create Collection'}
            </Button.Primary>
            <Button.Ghost onClick={cancel}>
              Cancel
            </Button.Ghost>
          </div>
        </div>
      </div>
    )
  }

  // ── Main Render ──────────────────────────────────────
  return (
    <div className="max-w-5xl animate-fade-in">
      {/* Header */}
      <div className="hero-section mb-8"
           style={{
             background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.04) 0%, rgba(13, 12, 20, 0.88) 30%, rgba(74, 222, 128, 0.03) 100%)',
             border: '1px solid rgba(244, 63, 94, 0.06)'
           }}>
        <div className="hero-orb w-72 h-72 -top-36 right-0 bg-rose-400" style={{ opacity: 0.06 }} />
        <div className="hero-orb w-48 h-48 -bottom-24 -left-12 bg-botanical-500" style={{ opacity: 0.05 }} />

        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl opacity-40">{'\u2661'}</span>
              <h1 className="text-2xl font-display font-bold tracking-wide"
                  style={{ background: 'linear-gradient(135deg, #f43f5e, #4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                My Collections
              </h1>
            </div>
            <p className="text-earth-400 text-sm pl-10">
              Personal groupings of plants that share a purpose, season, or meaning
            </p>
          </div>
          {viewMode === 'list' && (
            <Button.Primary route="/collections/new" className="flex-shrink-0">
              + New Collection
            </Button.Primary>
          )}
        </div>
        <div className="divider-gradient mt-6" />
      </div>

      {/* Content */}
      {viewMode === 'list' && renderList()}
      {viewMode === 'detail' && renderDetail()}
      {(viewMode === 'new' || viewMode === 'edit') && renderForm()}
    </div>
  )
}
