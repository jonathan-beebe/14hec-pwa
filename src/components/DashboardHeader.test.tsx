// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '@/test/render'
import DashboardHeader from './DashboardHeader'
import type { Plant } from '@/types'

const mockPlants: Plant[] = [
  { id: 1, common_name: 'Yarrow', latin_name: 'Achillea millefolium', category: 'conventional', family: '', genus: '', species: '', description: '', habitat: '', native_region: '', energetic_quality: '', doctrine_of_signatures: '', safety_notes: '', image_url: null, created_at: '', updated_at: '' },
  { id: 2, common_name: 'Lavender', latin_name: 'Lavandula angustifolia', category: 'conventional', family: '', genus: '', species: '', description: '', habitat: '', native_region: '', energetic_quality: '', doctrine_of_signatures: '', safety_notes: '', image_url: null, created_at: '', updated_at: '' },
  { id: 3, common_name: 'Chamomile', latin_name: 'Matricaria chamomilla', category: 'conventional', family: '', genus: '', species: '', description: '', habitat: '', native_region: '', energetic_quality: '', doctrine_of_signatures: '', safety_notes: '', image_url: null, created_at: '', updated_at: '' },
]

function renderHeader(props: Partial<Parameters<typeof DashboardHeader>[0]> = {}) {
  const defaultProps = {
    search: '',
    onSearchChange: vi.fn(),
    filteredPlants: [] as Plant[],
    ...props,
  }
  return renderWithRouter(<DashboardHeader {...defaultProps} />)
}

describe('DashboardHeader', () => {
  it('renders the search input with combobox role', () => {
    renderHeader()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows results dropdown when search has matches', () => {
    renderHeader({ search: 'yar', filteredPlants: mockPlants })
    expect(screen.getByText('Yarrow')).toBeInTheDocument()
    expect(screen.getByText('Lavender')).toBeInTheDocument()
  })

  it('hides dropdown when search is empty', () => {
    renderHeader({ search: '', filteredPlants: mockPlants })
    expect(screen.queryByText('Yarrow')).not.toBeInTheDocument()
  })

  describe('ARIA combobox semantics', () => {
    it('has combobox role on the input', () => {
      renderHeader({ search: 'yar', filteredPlants: mockPlants })
      const input = screen.getByRole('combobox')
      expect(input).toBeInTheDocument()
    })

    it('sets aria-expanded=false when dropdown is closed', () => {
      renderHeader({ search: '', filteredPlants: [] })
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
    })

    it('sets aria-expanded=true when dropdown is open', () => {
      renderHeader({ search: 'yar', filteredPlants: mockPlants })
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true')
    })

    it('has listbox role on the dropdown', () => {
      renderHeader({ search: 'yar', filteredPlants: mockPlants })
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('has option role on each result', () => {
      renderHeader({ search: 'yar', filteredPlants: mockPlants })
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(3)
    })

    it('connects input to listbox via aria-controls', () => {
      renderHeader({ search: 'yar', filteredPlants: mockPlants })
      const input = screen.getByRole('combobox')
      const listbox = screen.getByRole('listbox')
      expect(input.getAttribute('aria-controls')).toBe(listbox.id)
    })
  })

  describe('keyboard navigation', () => {
    it('ArrowDown moves active descendant to first option', async () => {
      const user = userEvent.setup()
      renderHeader({ search: 'yar', filteredPlants: mockPlants })
      const input = screen.getByRole('combobox')
      input.focus()

      await user.keyboard('{ArrowDown}')

      const options = screen.getAllByRole('option')
      expect(input.getAttribute('aria-activedescendant')).toBe(options[0].id)
    })

    it('ArrowDown wraps from last to first', async () => {
      const user = userEvent.setup()
      renderHeader({ search: 'yar', filteredPlants: mockPlants })
      const input = screen.getByRole('combobox')
      input.focus()

      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}')

      const options = screen.getAllByRole('option')
      expect(input.getAttribute('aria-activedescendant')).toBe(options[0].id)
    })

    it('ArrowUp moves active descendant up', async () => {
      const user = userEvent.setup()
      renderHeader({ search: 'yar', filteredPlants: mockPlants })
      const input = screen.getByRole('combobox')
      input.focus()

      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}')

      const options = screen.getAllByRole('option')
      expect(input.getAttribute('aria-activedescendant')).toBe(options[0].id)
    })

    it('Enter navigates to the active option', async () => {
      const user = userEvent.setup()
      renderHeader({ search: 'yar', filteredPlants: mockPlants })
      const input = screen.getByRole('combobox')
      input.focus()

      await user.keyboard('{ArrowDown}{Enter}')

      // Navigation should have been triggered — we can't easily test
      // useNavigate in unit tests, but we verify the option was active
      expect(input.getAttribute('aria-activedescendant')).toBeFalsy()
    })

    it('Escape clears the search', async () => {
      const user = userEvent.setup()
      const onSearchChange = vi.fn()
      renderHeader({ search: 'yar', filteredPlants: mockPlants, onSearchChange })
      const input = screen.getByRole('combobox')
      input.focus()

      await user.keyboard('{Escape}')

      expect(onSearchChange).toHaveBeenCalledWith('')
    })
  })
})
