import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

type Options = RenderOptions & { initialEntries?: string[] }

export function renderWithRouter(ui: ReactElement, options: Options = {}) {
  const { initialEntries = ['/'], ...rest } = options
  return render(
    <MemoryRouter initialEntries={initialEntries} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>{ui}</MemoryRouter>,
    rest,
  )
}
