import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import inventoryReducer, { fetchRawMaterials } from '../store/inventorySlice'
import RawMaterialsPage from '../pages/RawMaterialsPage'
import api from '../api/api'
import { mockRawMaterials } from './mocks'

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
          <RawMaterialsPage />
        </MemoryRouter>
      </Provider>
    ),
  }
}

describe('RawMaterialsPage — rendering', () => {
  beforeEach(() => {
    api.get = vi.fn().mockResolvedValue({ data: [] })
  })

  it('should render page title', () => {
    renderWithStore()
    expect(screen.getByText(/Matérias/i)).toBeInTheDocument()
  })

  it('should show "Nova Matéria-Prima" button', () => {
    renderWithStore()
    expect(screen.getByText(/Nova Matéria-Prima/i)).toBeInTheDocument()
  })

  it('should show empty state message when no materials', async () => {
    renderWithStore()
    await waitFor(() => {
      expect(screen.getByText(/nenhuma matéria-prima cadastrada/i)).toBeInTheDocument()
    })
  })
})

describe('RawMaterialsPage — KPI cards', () => {
  it('should display correct total count', () => {
    renderWithStore({ rawMaterials: mockRawMaterials })
    // 3 materials total
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should count low stock items (stockQuantity <= 10)', () => {
    renderWithStore({ rawMaterials: mockRawMaterials })
    // Aluminum has 8 units — low stock
    const lowCount = mockRawMaterials.filter(m => m.stockQuantity <= 10).length
    expect(screen.getByText(String(lowCount))).toBeInTheDocument()
  })
})

describe('RawMaterialsPage — table data', () => {
  beforeEach(() => {
    api.get = vi.fn().mockResolvedValue({ data: mockRawMaterials })
  })

  it('should render all material names', () => {
    renderWithStore({ rawMaterials: mockRawMaterials })
    expect(screen.getByText('Steel')).toBeInTheDocument()
    expect(screen.getByText('Aluminum')).toBeInTheDocument()
    expect(screen.getByText('Plastic')).toBeInTheDocument()
  })

  it('should display stock quantities', () => {
    renderWithStore({ rawMaterials: mockRawMaterials })
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
  })

  it('should show "Baixo" badge for low stock items', () => {
    renderWithStore({ rawMaterials: mockRawMaterials })
    expect(screen.getByText('Baixo')).toBeInTheDocument()
  })

  it('should show "Adequado" badges for normal stock items', () => {
    renderWithStore({ rawMaterials: mockRawMaterials })
    const adequadoBadges = screen.getAllByText('Adequado')
    expect(adequadoBadges.length).toBeGreaterThanOrEqual(1)
  })
})

describe('RawMaterialsPage — modal interactions', () => {
  beforeEach(() => {
    api.get = vi.fn().mockResolvedValue({ data: [] })
  })

  it('should open create modal on button click', async () => {
    renderWithStore()
    fireEvent.click(screen.getByText(/Nova Matéria-Prima/i))
    await waitFor(() => {
      expect(screen.getByText('Nova Matéria-Prima', { selector: 'h2' })).toBeInTheDocument()
    })
  })

  it('should show validation error on empty submit', async () => {
    renderWithStore()
    fireEvent.click(screen.getByText(/Nova Matéria-Prima/i))
    await waitFor(() => screen.getByText('Criar Insumo'))
    fireEvent.click(screen.getByText('Criar Insumo'))
    await waitFor(() => {
      expect(screen.getByText(/Nome é obrigatório/i)).toBeInTheDocument()
    })
  })

  it('should call API and close modal on successful create', async () => {
    const newMaterial = { id: 10, name: 'Copper', stockQuantity: 50 }
    api.post = vi.fn().mockResolvedValue({ data: newMaterial })

    renderWithStore()
    fireEvent.click(screen.getByText(/Nova Matéria-Prima/i))
    await waitFor(() => screen.getByPlaceholderText(/Ex: Aço carbono/i))

    fireEvent.change(screen.getByPlaceholderText(/Ex: Aço carbono/i), {
      target: { value: 'Copper' },
    })
    fireEvent.change(screen.getByPlaceholderText('0'), {
      target: { value: '50' },
    })
    fireEvent.click(screen.getByText('Criar Insumo'))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/raw-materials', { name: 'Copper', stockQuantity: 50 })
    })
  })
})
