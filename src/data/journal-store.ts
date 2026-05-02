/**
 * Journal entries stored in localStorage.
 * This is the only mutable data in the app.
 */

import { plantById } from './db'
import { promptById } from './db'
import type { JournalEntry } from '@/types'

const STORAGE_KEY = '14hec-journal-entries'
const ID_KEY = '14hec-journal-next-id'

interface StoredEntry {
  id: number
  plant_id: number | null
  prompt_id: number | null
  title: string | null
  content: string
  mood: string | null
  season: string | null
  entry_date: string
  created_at: string
  updated_at: string
}

function readEntries(): StoredEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeEntries(entries: StoredEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

function getNextId(): number {
  const current = parseInt(localStorage.getItem(ID_KEY) || '0', 10)
  const next = current + 1
  localStorage.setItem(ID_KEY, String(next))
  return next
}

function enrichEntry(e: StoredEntry): JournalEntry {
  const plant = e.plant_id ? plantById.get(e.plant_id) : null
  const prompt = e.prompt_id ? promptById.get(e.prompt_id) : null
  return {
    ...e,
    plant_name: plant?.common_name,
    prompt_text: prompt?.prompt_text
  }
}

export const journalStore = {
  getEntries(filters?: { plantId?: number; search?: string }): JournalEntry[] {
    let entries = readEntries()

    if (filters?.plantId) {
      entries = entries.filter(e => e.plant_id === filters.plantId)
    }

    if (filters?.search) {
      const s = filters.search.toLowerCase()
      entries = entries.filter(e =>
        (e.title || '').toLowerCase().includes(s) ||
        e.content.toLowerCase().includes(s)
      )
    }

    entries.sort((a, b) => {
      const dateCompare = b.entry_date.localeCompare(a.entry_date)
      if (dateCompare !== 0) return dateCompare
      return b.created_at.localeCompare(a.created_at)
    })

    return entries.map(enrichEntry)
  },

  createEntry(entry: {
    plant_id?: number | null
    prompt_id?: number | null
    title?: string | null
    content: string
    mood?: string | null
    season?: string | null
    entry_date?: string | null
  }): { id: number } {
    const entries = readEntries()
    const id = getNextId()
    const now = new Date().toISOString()
    const today = new Date().toISOString().split('T')[0]

    entries.push({
      id,
      plant_id: entry.plant_id ?? null,
      prompt_id: entry.prompt_id ?? null,
      title: entry.title ?? null,
      content: entry.content,
      mood: entry.mood ?? null,
      season: entry.season ?? null,
      entry_date: entry.entry_date ?? today,
      created_at: now,
      updated_at: now
    })

    writeEntries(entries)
    return { id }
  },

  updateEntry(id: number, updates: {
    title?: string | null
    content?: string
    mood?: string | null
    season?: string | null
    entry_date?: string | null
  }): { success: boolean } {
    const entries = readEntries()
    const entry = entries.find(e => e.id === id)
    if (!entry) return { success: false }

    if (updates.title !== undefined) entry.title = updates.title
    if (updates.content !== undefined) entry.content = updates.content
    if (updates.mood !== undefined) entry.mood = updates.mood
    if (updates.season !== undefined) entry.season = updates.season
    if (updates.entry_date !== undefined) entry.entry_date = updates.entry_date!
    entry.updated_at = new Date().toISOString()

    writeEntries(entries)
    return { success: true }
  },

  deleteEntry(id: number): { success: boolean } {
    const entries = readEntries()
    const filtered = entries.filter(e => e.id !== id)
    writeEntries(filtered)
    return { success: true }
  }
}
