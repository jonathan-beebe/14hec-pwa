import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import Select from './Select'

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'conventional', label: 'Conventional' },
  { value: 'entheogenic', label: 'Entheogenic' },
  { value: 'both', label: 'Both' },
] as const

function Controlled({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial)
  return (
    <Select
      label="Category"
      options={[...CATEGORIES]}
      value={value}
      onChange={setValue}
    />
  )
}

describe('Select', () => {
  it('is exposed to assistive tech via its label as accessible name', () => {
    render(<Controlled />)
    expect(screen.getByRole('combobox', { name: 'Category' })).toBeInTheDocument()
  })

  it('renders every provided option', () => {
    render(<Controlled />)
    const select = screen.getByRole('combobox', { name: 'Category' })
    const options = Array.from(select.querySelectorAll('option')).map((o) => ({
      value: o.value,
      label: o.textContent,
    }))
    expect(options).toEqual([
      { value: '', label: 'All Categories' },
      { value: 'conventional', label: 'Conventional' },
      { value: 'entheogenic', label: 'Entheogenic' },
      { value: 'both', label: 'Both' },
    ])
  })

  it('reflects the controlled value', () => {
    render(<Controlled initial="conventional" />)
    expect(screen.getByRole('combobox', { name: 'Category' })).toHaveValue(
      'conventional',
    )
  })

  it('fires onChange with the new option value', async () => {
    const user = userEvent.setup()
    render(<Controlled />)
    const select = screen.getByRole('combobox', { name: 'Category' })

    await user.selectOptions(select, 'entheogenic')

    expect(select).toHaveValue('entheogenic')
  })

  it('hides the visible label text from sighted users by default (visually hidden)', () => {
    // The aria-label drives the accessible name; we do not duplicate a
    // visible label in a FilterBar row by default. Sighted users orient by
    // the option text and the surrounding row context. A future variant
    // could expose a visible label, but it is not the default.
    render(<Controlled />)
    // No visible <label> element should be associated with the combobox.
    // The accessible name is set via aria-label, not a separate label.
    const select = screen.getByRole('combobox', { name: 'Category' })
    expect(select).toHaveAttribute('aria-label', 'Category')
  })
})
