import { useState, useEffect, useMemo } from 'react'
import type { Page } from '../../App'
import type { Plant, JournalEntry, JournalPrompt } from '../../types'

interface JournalViewProps {
  navigate: (page: Page) => void
}

type ViewMode = 'list' | 'new' | 'edit' | 'view'

const MOODS = ['grateful', 'curious', 'peaceful', 'energized', 'reflective', 'challenged', 'transformed'] as const

const MOOD_ICONS: Record<string, string> = {
  grateful: '\u2661',
  curious: '\u2609',
  peaceful: '\u2618',
  energized: '\u2726',
  reflective: '\u263D',
  challenged: '\u2638',
  transformed: '\u2727'
}

const MOOD_COLORS: Record<string, string> = {
  grateful: 'rgba(244, 63, 94, 0.7)',
  curious: 'rgba(59, 130, 246, 0.7)',
  peaceful: 'rgba(61, 138, 94, 0.7)',
  energized: 'rgba(251, 191, 36, 0.7)',
  reflective: 'rgba(124, 94, 237, 0.7)',
  challenged: 'rgba(245, 158, 11, 0.7)',
  transformed: 'rgba(168, 85, 247, 0.7)'
}

function getCurrentSeason(): string {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function JournalView({ navigate }: JournalViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [plants, setPlants] = useState<Plant[]>([])
  const [prompts, setPrompts] = useState<JournalPrompt[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null)
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null)
  const [mood, setMood] = useState('')
  const [saving, setSaving] = useState(false)

  // Filters
  const [filterPlantId, setFilterPlantId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)

  // Load entries and plants on mount
  useEffect(() => {
    loadEntries()
    window.api.getPlants().then(setPlants)
  }, [])

  // Load prompts when plant selection changes
  useEffect(() => {
    const params = selectedPlantId ? { plantId: selectedPlantId } : undefined
    window.api.getJournalPrompts(params).then(setPrompts).catch(() => setPrompts([]))
  }, [selectedPlantId])

  async function loadEntries() {
    setLoading(true)
    try {
      const params = filterPlantId ? { plantId: filterPlantId } : undefined
      const data = await window.api.getJournalEntries(params)
      setEntries(data)
    } catch {
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  // Re-load entries when filter changes
  useEffect(() => {
    loadEntries()
  }, [filterPlantId])

  // Filtered and searched entries
  const filteredEntries = useMemo(() => {
    let result = entries
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.content.toLowerCase().includes(q) ||
          (e.plant_name && e.plant_name.toLowerCase().includes(q))
      )
    }
    // Sort newest first
    return [...result].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [entries, searchQuery])

  function resetForm() {
    setTitle('')
    setContent('')
    setSelectedPlantId(null)
    setSelectedPromptId(null)
    setMood('')
    setEditingEntry(null)
  }

  function startNewEntry() {
    resetForm()
    setViewMode('new')
  }

  function startEditEntry(entry: JournalEntry) {
    setEditingEntry(entry)
    setTitle(entry.title)
    setContent(entry.content)
    setSelectedPlantId(entry.plant_id)
    setSelectedPromptId(entry.prompt_id)
    setMood(entry.mood || '')
    setViewMode('edit')
  }

  function viewEntry(entry: JournalEntry) {
    setEditingEntry(entry)
    setViewMode('view')
  }

  async function saveEntry() {
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    try {
      const entryData = {
        title: title.trim(),
        content: content.trim(),
        plant_id: selectedPlantId,
        prompt_id: selectedPromptId,
        mood: mood || null,
        season: getCurrentSeason()
      }

      if (viewMode === 'edit' && editingEntry) {
        await window.api.updateJournalEntry({ ...entryData, id: editingEntry.id })
      } else {
        await window.api.createJournalEntry(entryData)
      }

      await loadEntries()
      resetForm()
      setViewMode('list')
    } catch (err) {
      console.error('Failed to save journal entry:', err)
    } finally {
      setSaving(false)
    }
  }

  async function deleteEntry(id: number) {
    try {
      await window.api.deleteJournalEntry(id)
      await loadEntries()
      setShowDeleteConfirm(null)
      if (viewMode !== 'list') {
        resetForm()
        setViewMode('list')
      }
    } catch (err) {
      console.error('Failed to delete journal entry:', err)
    }
  }

  function selectPrompt(prompt: JournalPrompt) {
    setSelectedPromptId(prompt.id)
    if (!content) {
      setContent('')
    }
  }

  // ── Render: Entry List ──────────────────────────────────
  function renderList() {
    return (
      <div className="animate-fade-in">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-earth-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search journal entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <select
            value={filterPlantId || ''}
            onChange={(e) => setFilterPlantId(e.target.value ? Number(e.target.value) : null)}
            className="select-field"
          >
            <option value="">All plants</option>
            {plants.map((p) => (
              <option key={p.id} value={p.id}>{p.common_name}</option>
            ))}
          </select>
        </div>

        {/* Entries */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-28 rounded-2xl" />
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl opacity-20 mb-4">{'\u270E'}</div>
            <p className="text-earth-400 text-sm mb-2">
              {entries.length === 0 ? 'Your journal awaits its first entry' : 'No entries match your search'}
            </p>
            {entries.length === 0 && (
              <p className="text-earth-500 text-xs font-display italic">
                Begin your record of plant relationships and inner exploration
              </p>
            )}
            <button onClick={startNewEntry} className="btn-primary mt-6">
              Write Your First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredEntries.map((entry, i) => (
              <button
                key={entry.id}
                onClick={() => viewEntry(entry)}
                className="card w-full text-left cursor-pointer group animate-fade-in-up"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-display font-semibold text-earth-100 group-hover:text-botanical-400 transition-colors truncate">
                        {entry.title}
                      </h3>
                      {entry.mood && (
                        <span
                          className="text-xs flex-shrink-0"
                          style={{ color: MOOD_COLORS[entry.mood] || 'rgba(255,255,255,0.4)' }}
                          title={entry.mood}
                        >
                          {MOOD_ICONS[entry.mood] || '\u25CB'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] text-earth-500">{formatDateShort(entry.created_at)}</span>
                      {entry.plant_name && (
                        <>
                          <span className="text-earth-700 text-[10px]">{'\u00b7'}</span>
                          <span className="text-[10px] text-botanical-500">{entry.plant_name}</span>
                        </>
                      )}
                    </div>
                    <p className="text-earth-400 text-xs leading-relaxed line-clamp-2">
                      {entry.content.slice(0, 120)}{entry.content.length > 120 ? '...' : ''}
                    </p>
                    {entry.prompt_text && (
                      <p className="text-earth-600 text-[10px] mt-1.5 italic truncate">
                        Prompt: {entry.prompt_text}
                      </p>
                    )}
                  </div>
                  <div className="text-earth-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1">
                    {'\u2192'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Render: View Entry ──────────────────────────────────
  function renderViewEntry() {
    if (!editingEntry) return null
    return (
      <div className="animate-fade-in">
        <button onClick={() => { resetForm(); setViewMode('list') }} className="btn-ghost mb-4 inline-flex items-center gap-1">
          {'\u2190'} Back to Journal
        </button>

        <div className="card p-8 mb-4"
             style={{
               background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.03) 0%, rgba(26, 25, 21, 0.65) 100%)',
               borderColor: 'rgba(245, 158, 11, 0.06)'
             }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-earth-100 tracking-wide mb-1">
                {editingEntry.title}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-earth-500">{formatDate(editingEntry.created_at)}</span>
                {editingEntry.plant_name && (
                  <>
                    <span className="text-earth-700 text-xs">{'\u00b7'}</span>
                    <span className="text-xs text-botanical-500">{'\u2618'} {editingEntry.plant_name}</span>
                  </>
                )}
                {editingEntry.mood && (
                  <>
                    <span className="text-earth-700 text-xs">{'\u00b7'}</span>
                    <span className="text-xs capitalize" style={{ color: MOOD_COLORS[editingEntry.mood] || 'rgba(255,255,255,0.4)' }}>
                      {MOOD_ICONS[editingEntry.mood]} {editingEntry.mood}
                    </span>
                  </>
                )}
                {editingEntry.season && (
                  <>
                    <span className="text-earth-700 text-xs">{'\u00b7'}</span>
                    <span className="text-xs text-earth-500 capitalize">{editingEntry.season}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {editingEntry.prompt_text && (
            <div className="rounded-xl p-3 mb-5"
                 style={{
                   background: 'rgba(255, 255, 255, 0.03)',
                   border: '1px solid rgba(255, 255, 255, 0.04)'
                 }}>
              <span className="text-[10px] uppercase tracking-[0.12em] text-earth-500 font-medium">Guided by</span>
              <p className="text-earth-400 text-xs mt-1 italic font-display">{editingEntry.prompt_text}</p>
            </div>
          )}

          <div className="divider-gradient mb-5" />

          <div className="text-earth-200 text-sm leading-[1.85] whitespace-pre-wrap font-body">
            {editingEntry.content}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => startEditEntry(editingEntry)} className="btn-primary">
            Edit Entry
          </button>
          {showDeleteConfirm === editingEntry.id ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-earth-400">Are you sure?</span>
              <button
                onClick={() => deleteEntry(editingEntry.id)}
                className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 rounded-lg transition-colors"
                style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.15)' }}
              >
                Yes, delete
              </button>
              <button onClick={() => setShowDeleteConfirm(null)} className="btn-ghost text-xs">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(editingEntry.id)}
              className="btn-ghost text-xs text-earth-500 hover:text-red-400"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Render: New/Edit Entry Form ──────────────────────────
  function renderForm() {
    const isEdit = viewMode === 'edit'
    return (
      <div className="animate-fade-in">
        <button onClick={() => { resetForm(); setViewMode('list') }} className="btn-ghost mb-4 inline-flex items-center gap-1">
          {'\u2190'} Back to Journal
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-display font-bold text-earth-100 tracking-wide">
            {isEdit ? 'Edit Entry' : 'New Journal Entry'}
          </h2>
          <p className="text-earth-500 text-xs mt-1">
            {isEdit ? 'Refine your reflections' : 'Take a moment. Breathe. Write what comes.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form area - spans 2 cols */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title */}
            <div>
              <label className="text-[11px] text-earth-500 uppercase tracking-[0.12em] font-medium mb-1.5 block">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give this entry a name..."
                className="input-field text-base font-display"
              />
            </div>

            {/* Selected prompt display */}
            {selectedPromptId && prompts.find((p) => p.id === selectedPromptId) && (
              <div className="rounded-xl p-3 flex items-start gap-3"
                   style={{
                     background: 'rgba(245, 158, 11, 0.04)',
                     border: '1px solid rgba(245, 158, 11, 0.1)'
                   }}>
                <span className="text-xs mt-0.5" style={{ color: 'rgba(251, 191, 36, 0.6)' }}>{'\u2727'}</span>
                <div className="flex-1">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-earth-500 font-medium">Writing with prompt</span>
                  <p className="text-earth-300 text-xs mt-1 italic font-display">
                    {prompts.find((p) => p.id === selectedPromptId)?.prompt_text}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPromptId(null)}
                  className="text-earth-600 hover:text-earth-400 text-xs transition-colors"
                >
                  {'\u2715'}
                </button>
              </div>
            )}

            {/* Content */}
            <div>
              <label className="text-[11px] text-earth-500 uppercase tracking-[0.12em] font-medium mb-1.5 block">Reflection</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Let your thoughts flow freely..."
                className="input-field resize-none font-body leading-relaxed"
                style={{ minHeight: '280px' }}
              />
            </div>

            {/* Save button */}
            <div className="flex items-center gap-3">
              <button
                onClick={saveEntry}
                disabled={!title.trim() || !content.trim() || saving}
                className="btn-primary"
              >
                {saving ? 'Saving...' : isEdit ? 'Update Entry' : 'Save Entry'}
              </button>
              <button onClick={() => { resetForm(); setViewMode('list') }} className="btn-ghost">
                Cancel
              </button>
            </div>
          </div>

          {/* Sidebar: Plant, Mood, Prompts */}
          <div className="space-y-5">
            {/* Plant selector */}
            <div className="card p-4"
                 style={{
                   background: 'rgba(26, 25, 21, 0.5)',
                   borderColor: 'rgba(93, 168, 126, 0.06)'
                 }}>
              <label className="text-[11px] text-earth-500 uppercase tracking-[0.12em] font-medium mb-2 block">
                {'\u2618'} Associated Plant
              </label>
              <select
                value={selectedPlantId || ''}
                onChange={(e) => setSelectedPlantId(e.target.value ? Number(e.target.value) : null)}
                className="select-field w-full"
              >
                <option value="">No plant selected</option>
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>{p.common_name}</option>
                ))}
              </select>
            </div>

            {/* Mood selector */}
            <div className="card p-4"
                 style={{
                   background: 'rgba(26, 25, 21, 0.5)',
                   borderColor: 'rgba(124, 94, 237, 0.06)'
                 }}>
              <label className="text-[11px] text-earth-500 uppercase tracking-[0.12em] font-medium mb-2.5 block">
                How are you feeling?
              </label>
              <div className="flex flex-wrap gap-1.5">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(mood === m ? '' : m)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] capitalize transition-all duration-150 ${
                      mood === m
                        ? 'ring-1 ring-inset'
                        : 'hover:bg-[rgba(255,255,255,0.04)]'
                    }`}
                    style={mood === m ? {
                      background: `${MOOD_COLORS[m]}15`,
                      color: MOOD_COLORS[m],
                      ringColor: `${MOOD_COLORS[m]}30`
                    } : {
                      color: 'rgba(255, 255, 255, 0.4)'
                    }}
                  >
                    {MOOD_ICONS[m]} {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Season (auto-detected) */}
            <div className="card p-4"
                 style={{
                   background: 'rgba(26, 25, 21, 0.5)',
                   borderColor: 'rgba(255, 255, 255, 0.04)'
                 }}>
              <label className="text-[11px] text-earth-500 uppercase tracking-[0.12em] font-medium mb-1.5 block">
                Season
              </label>
              <span className="text-xs text-earth-300 capitalize">{getCurrentSeason()}</span>
              <span className="text-earth-600 text-[10px] ml-2">(auto-detected)</span>
            </div>

            {/* Prompts */}
            {prompts.length > 0 && (
              <div className="card p-4"
                   style={{
                     background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.03), rgba(26, 25, 21, 0.5))',
                     borderColor: 'rgba(245, 158, 11, 0.08)'
                   }}>
                <label className="text-[11px] text-earth-500 uppercase tracking-[0.12em] font-medium mb-2.5 block">
                  {'\u2727'} Guided Prompts
                </label>
                <div className="space-y-2">
                  {prompts.map((prompt) => (
                    <button
                      key={prompt.id}
                      onClick={() => selectPrompt(prompt)}
                      className={`w-full text-left rounded-lg p-2.5 text-xs transition-all duration-150 ${
                        selectedPromptId === prompt.id
                          ? 'text-earth-200'
                          : 'text-earth-400 hover:text-earth-300'
                      }`}
                      style={{
                        background: selectedPromptId === prompt.id
                          ? 'rgba(245, 158, 11, 0.06)'
                          : 'rgba(255, 255, 255, 0.02)',
                        border: selectedPromptId === prompt.id
                          ? '1px solid rgba(245, 158, 11, 0.15)'
                          : '1px solid rgba(255, 255, 255, 0.03)'
                      }}
                    >
                      <p className="italic font-display leading-relaxed">{prompt.prompt_text}</p>
                      {prompt.dimension && (
                        <span className="text-[9px] text-earth-600 uppercase tracking-wider mt-1 block">
                          {prompt.dimension}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
             background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(16, 15, 12, 0.88) 40%, rgba(124, 94, 237, 0.03) 100%)',
             border: '1px solid rgba(245, 158, 11, 0.06)'
           }}>
        <div className="hero-orb w-72 h-72 -top-36 right-0 bg-amber-400" style={{ opacity: 0.08 }} />
        <div className="hero-orb w-48 h-48 -bottom-24 -left-12 bg-celestial-500" style={{ opacity: 0.06 }} />

        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl opacity-40">{'\u270E'}</span>
              <h1 className="text-2xl font-display font-bold text-gradient-gold tracking-wide">Plant Journal</h1>
            </div>
            <p className="text-earth-400 text-sm pl-10">
              Your living record of plant relationships and consciousness exploration
            </p>
          </div>
          {viewMode === 'list' && (
            <button onClick={startNewEntry} className="btn-primary flex-shrink-0">
              + New Entry
            </button>
          )}
        </div>
        <div className="divider-gradient mt-6" />
      </div>

      {/* Content */}
      {viewMode === 'list' && renderList()}
      {viewMode === 'view' && renderViewEntry()}
      {(viewMode === 'new' || viewMode === 'edit') && renderForm()}
    </div>
  )
}
