import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { api } from '@/data/api'
import type { JournalEntry, JournalPrompt, Plant } from '../../types'
import Button from '@/components/design-system/atoms/Button'
import Text from '@/components/design-system/atoms/Text'

type ViewMode = 'new' | 'edit' | 'view'

const MOODS = [
  'grateful',
  'curious',
  'peaceful',
  'energized',
  'reflective',
  'challenged',
  'transformed',
] as const

const MOOD_ICONS: Record<string, string> = {
  grateful: '♡',
  curious: '☉',
  peaceful: '☘',
  energized: '✦',
  reflective: '☽',
  challenged: '☸',
  transformed: '✧',
}

const MOOD_COLORS: Record<string, string> = {
  grateful: 'rgba(244, 63, 94, 0.7)',
  curious: 'rgba(59, 130, 246, 0.7)',
  peaceful: 'rgba(61, 138, 94, 0.7)',
  energized: 'rgba(251, 191, 36, 0.7)',
  reflective: 'rgba(124, 94, 237, 0.7)',
  challenged: 'rgba(245, 158, 11, 0.7)',
  transformed: 'rgba(168, 85, 247, 0.7)',
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
    day: 'numeric',
  })
}

export default function JournalView() {
  const navigate = useNavigate()
  const { id: idParam } = useParams<{ id?: string }>()
  const { pathname } = useLocation()
  const id = idParam ? Number(idParam) : null

  // viewMode derived from URL + local edit toggle.
  // /journal/new → new ; /journal/:id → view (default) or edit
  const [editing, setEditing] = useState(false)
  const viewMode: ViewMode =
    pathname === '/journal/new' ? 'new' : editing ? 'edit' : 'view'

  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [plants, setPlants] = useState<Plant[]>([])
  const [prompts, setPrompts] = useState<JournalPrompt[]>([])

  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null)
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null)
  const [mood, setMood] = useState('')
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    api.getPlants().then(setPlants)
  }, [])

  useEffect(() => {
    const params = selectedPlantId ? { plantId: selectedPlantId } : undefined
    api.getJournalPrompts(params).then(setPrompts).catch(() => setPrompts([]))
  }, [selectedPlantId])

  // Load entry from URL when in detail mode
  useEffect(() => {
    if (id === null) {
      setEntry(null)
      resetForm()
      setEditing(false)
      return
    }
    api.getJournalEntryById(id).then((loaded) => {
      setEntry(loaded)
      if (loaded) {
        setTitle(loaded.title || '')
        setContent(loaded.content)
        setSelectedPlantId(loaded.plant_id)
        setSelectedPromptId(loaded.prompt_id)
        setMood(loaded.mood || '')
      }
    })
  }, [id])

  function resetForm() {
    setTitle('')
    setContent('')
    setSelectedPlantId(null)
    setSelectedPromptId(null)
    setMood('')
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
        season: getCurrentSeason(),
      }

      if (viewMode === 'edit' && entry) {
        await api.updateJournalEntry(entry.id, entryData)
      } else {
        await api.createJournalEntry(entryData)
      }

      navigate('/journal')
    } catch (err) {
      console.error('Failed to save journal entry:', err)
    } finally {
      setSaving(false)
    }
  }

  async function deleteEntry(entryId: number) {
    try {
      await api.deleteJournalEntry(entryId)
      navigate('/journal')
    } catch (err) {
      console.error('Failed to delete journal entry:', err)
    }
  }

  function selectPrompt(prompt: JournalPrompt) {
    setSelectedPromptId(prompt.id)
  }

  function renderViewEntry() {
    if (!entry) return null
    return (
      <div className="animate-fade-in">
        <Button.Ghost
          route="/journal"
          className="mb-4 inline-flex items-center gap-1"
        >
          {'←'} Back to Journal
        </Button.Ghost>

        <div
          className="card p-8 mb-4"
          style={{
            background:
              'linear-gradient(135deg, rgba(245, 158, 11, 0.03) 0%, rgba(26, 25, 21, 0.65) 100%)',
            borderColor: 'rgba(245, 158, 11, 0.06)',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <Text.Heading className="mb-1">{entry.title}</Text.Heading>
              <div className="flex items-center gap-3">
                <span className="text-xs text-earth-500">
                  {formatDate(entry.created_at)}
                </span>
                {entry.plant_name && (
                  <>
                    <span className="text-earth-700 text-xs">·</span>
                    <span className="text-xs text-botanical-500">
                      ☘ {entry.plant_name}
                    </span>
                  </>
                )}
                {entry.mood && (
                  <>
                    <span className="text-earth-700 text-xs">·</span>
                    <span
                      className="text-xs capitalize"
                      style={{
                        color:
                          MOOD_COLORS[entry.mood] || 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {MOOD_ICONS[entry.mood]} {entry.mood}
                    </span>
                  </>
                )}
                {entry.season && (
                  <>
                    <span className="text-earth-700 text-xs">·</span>
                    <span className="text-xs text-earth-500 capitalize">
                      {entry.season}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {entry.prompt_text && (
            <div
              className="rounded-xl p-3 mb-5"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}
            >
              <span className="text-[10px] uppercase tracking-[0.12em] text-earth-500 font-medium">
                Guided by
              </span>
              <p className="text-earth-400 text-xs mt-1 italic font-display">
                {entry.prompt_text}
              </p>
            </div>
          )}

          <div className="divider-gradient mb-5" />

          <div className="text-earth-200 text-sm leading-[1.85] whitespace-pre-wrap font-body">
            {entry.content}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button.Primary onClick={() => setEditing(true)}>Edit Entry</Button.Primary>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-earth-400">Are you sure?</span>
              <button
                onClick={() => deleteEntry(entry.id)}
                className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 rounded-lg transition-colors"
                style={{
                  background: 'rgba(220, 38, 38, 0.1)',
                  border: '1px solid rgba(220, 38, 38, 0.15)',
                }}
              >
                Yes, delete
              </button>
              <Button.Ghost
                onClick={() => setShowDeleteConfirm(false)}
                className="text-xs"
              >
                Cancel
              </Button.Ghost>
            </div>
          ) : (
            <Button.Ghost
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs text-earth-500 hover:text-red-400"
            >
              Delete
            </Button.Ghost>
          )}
        </div>
      </div>
    )
  }

  function renderForm() {
    const isEdit = viewMode === 'edit'
    const cancel = () => {
      if (isEdit && entry) {
        setEditing(false)
      } else {
        navigate('/journal')
      }
    }
    return (
      <div className="animate-fade-in">
        <Button.Ghost
          onClick={cancel}
          className="mb-4 inline-flex items-center gap-1"
        >
          {'←'} {isEdit ? 'Cancel edits' : 'Back to Journal'}
        </Button.Ghost>

        <div className="mb-6">
          <Text.PageTitle as="h2">
            {isEdit ? 'Edit Entry' : 'New Journal Entry'}
          </Text.PageTitle>
          <p className="text-earth-500 text-xs mt-1">
            {isEdit
              ? 'Refine your reflections'
              : 'Take a moment. Breathe. Write what comes.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div>
              <label className="text-[11px] text-earth-500 uppercase tracking-[0.12em] font-medium mb-1.5 block">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give this entry a name..."
                className="input-field text-base font-display"
              />
            </div>

            {selectedPromptId &&
              prompts.find((p) => p.id === selectedPromptId) && (
                <div
                  className="rounded-xl p-3 flex items-start gap-3"
                  style={{
                    background: 'rgba(245, 158, 11, 0.04)',
                    border: '1px solid rgba(245, 158, 11, 0.1)',
                  }}
                >
                  <span
                    className="text-xs mt-0.5"
                    style={{ color: 'rgba(251, 191, 36, 0.6)' }}
                  >
                    ✧
                  </span>
                  <div className="flex-1">
                    <span className="text-[10px] uppercase tracking-[0.12em] text-earth-500 font-medium">
                      Writing with prompt
                    </span>
                    <p className="text-earth-300 text-xs mt-1 italic font-display">
                      {prompts.find((p) => p.id === selectedPromptId)?.prompt_text}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPromptId(null)}
                    className="text-earth-600 hover:text-earth-400 text-xs transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}

            <div>
              <label className="text-[11px] text-earth-500 uppercase tracking-[0.12em] font-medium mb-1.5 block">
                Reflection
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Let your thoughts flow freely..."
                className="input-field resize-none font-body leading-relaxed"
                style={{ minHeight: '280px' }}
              />
            </div>

            <div className="flex items-center gap-3">
              <Button.Primary
                onClick={saveEntry}
                disabled={!title.trim() || !content.trim() || saving}
              >
                {saving ? 'Saving...' : isEdit ? 'Update Entry' : 'Save Entry'}
              </Button.Primary>
              <Button.Ghost onClick={cancel}>Cancel</Button.Ghost>
            </div>
          </div>

          <div className="space-y-5">
            <div
              className="card p-4"
              style={{
                background: 'rgba(26, 25, 21, 0.5)',
                borderColor: 'rgba(93, 168, 126, 0.06)',
              }}
            >
              <label className="text-[11px] text-earth-500 uppercase tracking-[0.12em] font-medium mb-2 block">
                ☘ Associated Plant
              </label>
              <select
                value={selectedPlantId || ''}
                onChange={(e) =>
                  setSelectedPlantId(e.target.value ? Number(e.target.value) : null)
                }
                className="select-field w-full"
              >
                <option value="">No plant selected</option>
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.common_name}
                  </option>
                ))}
              </select>
            </div>

            <div
              className="card p-4"
              style={{
                background: 'rgba(26, 25, 21, 0.5)',
                borderColor: 'rgba(124, 94, 237, 0.06)',
              }}
            >
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
                    style={
                      mood === m
                        ? {
                            background: `${MOOD_COLORS[m]}15`,
                            color: MOOD_COLORS[m],
                            boxShadow: `inset 0 0 0 1px ${MOOD_COLORS[m]}30`,
                          }
                        : { color: 'rgba(255, 255, 255, 0.4)' }
                    }
                  >
                    {MOOD_ICONS[m]} {m}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="card p-4"
              style={{
                background: 'rgba(26, 25, 21, 0.5)',
                borderColor: 'rgba(255, 255, 255, 0.04)',
              }}
            >
              <label className="text-[11px] text-earth-500 uppercase tracking-[0.12em] font-medium mb-1.5 block">
                Season
              </label>
              <span className="text-xs text-earth-300 capitalize">
                {getCurrentSeason()}
              </span>
              <span className="text-earth-600 text-[10px] ml-2">
                (auto-detected)
              </span>
            </div>

            {prompts.length > 0 && (
              <div
                className="card p-4"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(245, 158, 11, 0.03), rgba(26, 25, 21, 0.5))',
                  borderColor: 'rgba(245, 158, 11, 0.08)',
                }}
              >
                <label className="text-[11px] text-earth-500 uppercase tracking-[0.12em] font-medium mb-2.5 block">
                  ✧ Guided Prompts
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
                        background:
                          selectedPromptId === prompt.id
                            ? 'rgba(245, 158, 11, 0.06)'
                            : 'rgba(255, 255, 255, 0.02)',
                        border:
                          selectedPromptId === prompt.id
                            ? '1px solid rgba(245, 158, 11, 0.15)'
                            : '1px solid rgba(255, 255, 255, 0.03)',
                      }}
                    >
                      <p className="italic font-display leading-relaxed">
                        {prompt.prompt_text}
                      </p>
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

  return (
    <div className="max-w-5xl animate-fade-in">
      {viewMode === 'view' && renderViewEntry()}
      {(viewMode === 'new' || viewMode === 'edit') && renderForm()}
    </div>
  )
}
