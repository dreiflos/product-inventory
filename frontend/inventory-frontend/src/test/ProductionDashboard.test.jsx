import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import inventoryReducer from '../store/inventorySlice'
import ProductionDashboard from '../pages/ProductionDashboard'
import api from '../api/api'
import { mockSuggestions } from './mocks'

vi.mock('../api/api')

const renderWithStore = (preloadedState = {}) => {
  const store = configureStore({
    reducer: { inventory: inventoryReducer },
    preloadedState: {
      inventory: {
        products: [],
        rawMaterials: [],
        suggestions: [],
        loading: false,
        actionLoading: false,
        total: 0,
        error: null,
        ...preloadedState,
      },
    },
  })
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter>
          <ProductionDashboard />
        </MemoryRouter>
      </Provider>
    ),
  }
}

describe('ProductionDashboard — rendering', () => {
  beforeEach(() => {
    api.get = vi.fn().mockResolvedValue({ data: mockSuggestions })
  })

  it('should render page title', () => {
    renderWithStore()
    expect(screen.getByText(/Sugestão de/i)).toBeInTheDocument()
    expect(screen.getByText(/Produção/i)).toBeInTheDocument()
  })

  it('should render Atualizar button', () => {
    renderWithStore()
    expect(screen.getByText(/Atualizar/i)).toBeInTheDocument()
  })
})

describe('ProductionDashboard — with suggestions', () => {
  const suggestions = mockSuggestions.suggestedItems

  it('should display product names from suggestions', () => {
    renderWithStore({ suggestions, total: mockSuggestions.totalEstimatedValue })
    expect(screen.getByText('Widget Alpha')).toBeInTheDocument()
    expect(screen.getByText('Widget Beta')).toBeInTheDocument()
  })

  it('should display quantities correctly', () => {
    renderWithStore({ suggestions, total: mockSuggestions.totalEstimatedValue })
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should display total estimated value in KPI card', () => {
    renderWithStore({ suggestions, total: 3400 })
    expect(screen.getByText(/R\$ 3\.400,00/i)).toBeInTheDocument()
  })

  it('should display total units to produce in KPI card', () => {
    renderWithStore({ suggestions, total: mockSuggestions.totalEstimatedValue })
    expect(screen.getByText('25')).toBeInTheDocument()
  })

  it('should mark the product with highest subtotal as "Top"', () => {
    renderWithStore({ suggestions, total: mockSuggestions.totalEstimatedValue })
    expect(screen.getByText('Top')).toBeInTheDocument()
  })

  it('should show the best product name in the KPI card', () => {
    renderWithStore({ suggestions, total: mockSuggestions.totalEstimatedValue })
    expect(screen.getByText('Widget Alpha')).toBeInTheDocument()
  })
})

describe('ProductionDashboard — empty state', () => {
  it('should show empty message when no suggestions', async () => {
    api.get = vi.fn().mockResolvedValue({
      data: { suggestedItems: [], totalEstimatedValue: 0 },
    })
    renderWithStore({ suggestions: [], total: 0 })
    await waitFor(() => {
      expect(screen.getByText(/nenhuma sugestão disponível/i)).toBeInTheDocument()
    })
  })
})

describe('ProductionDashboard — loading state', () => {
  it('should show loading spinner when loading is true', () => {
    renderWithStore({ loading: true })
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })
})

describe('ProductionDashboard — refresh button', () => {
  it('should call fetchSuggestions when Atualizar is clicked', async () => {
    api.get = vi.fn().mockResolvedValue({ data: mockSuggestions })
    renderWithStore()

    fireEvent.click(screen.getByText(/Atualizar/i))

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/production/suggested')
    })
  })

  it('should disable button while loading', () => {
    renderWithStore({ loading: true })
    const btn = screen.getByText(/Atualizar/i)
    expect(btn).toBeDisabled()
  })
})
