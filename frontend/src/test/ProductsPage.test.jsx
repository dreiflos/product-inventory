import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import inventoryReducer from '../store/inventorySlice'
import ProductsPage from '../pages/ProductsPage'
import api from '../api/api'
import { mockProducts, mockRawMaterials } from './mocks'

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
          <ProductsPage />
        </MemoryRouter>
      </Provider>
    ),
  }
}

describe('ProductsPage — empty state', () => {
  beforeEach(() => {
    api.get = vi.fn().mockResolvedValue({ data: [] })
  })

  it('should render the page title', async () => {
    renderWithStore()
    expect(screen.getByText(/Produtos/i)).toBeInTheDocument()
  })

  it('should show empty state message when no products', async () => {
    renderWithStore()
    await waitFor(() => {
      expect(screen.getByText(/nenhum produto cadastrado/i)).toBeInTheDocument()
    })
  })

  it('should show "Novo Produto" button', () => {
    renderWithStore()
    expect(screen.getByText(/Novo Produto/i)).toBeInTheDocument()
  })
})

describe('ProductsPage — with products', () => {
  beforeEach(() => {
    api.get = vi.fn().mockResolvedValue({ data: mockProducts })
  })

  it('should render product names', async () => {
    renderWithStore({ products: mockProducts, rawMaterials: mockRawMaterials })
    expect(screen.getByText('Widget Alpha')).toBeInTheDocument()
    expect(screen.getByText('Widget Beta')).toBeInTheDocument()
  })

  it('should render product prices correctly', () => {
    renderWithStore({ products: mockProducts, rawMaterials: mockRawMaterials })
    expect(screen.getByText('R$ 150.00')).toBeInTheDocument()
    expect(screen.getByText('R$ 80.00')).toBeInTheDocument()
  })

  it('should show composition count badge', () => {
    renderWithStore({ products: mockProducts, rawMaterials: mockRawMaterials })
    expect(screen.getByText('1 insumos')).toBeInTheDocument()
    expect(screen.getByText('0 insumos')).toBeInTheDocument()
  })
})

describe('ProductsPage — modal interactions', () => {
  beforeEach(() => {
    api.get = vi.fn().mockResolvedValue({ data: [] })
  })

  it('should open create modal when clicking "Novo Produto"', async () => {
    renderWithStore()
    const btn = screen.getByText(/Novo Produto/i)
    fireEvent.click(btn)
    await waitFor(() => {
      expect(screen.getByText('Novo Produto', { selector: 'h2' })).toBeInTheDocument()
    })
  })

  it('should close modal when clicking Cancelar', async () => {
    renderWithStore()
    fireEvent.click(screen.getByText(/Novo Produto/i))
    await waitFor(() => screen.getByText('Cancelar'))
    fireEvent.click(screen.getByText('Cancelar'))
    await waitFor(() => {
      expect(screen.queryByText('Criar Produto')).not.toBeInTheDocument()
    })
  })

  it('should show validation error when submitting empty form', async () => {
    renderWithStore()
    fireEvent.click(screen.getByText(/Novo Produto/i))
    await waitFor(() => screen.getByText('Criar Produto'))
    fireEvent.click(screen.getByText('Criar Produto'))
    await waitFor(() => {
      expect(screen.getByText(/Nome é obrigatório/i)).toBeInTheDocument()
    })
  })

  it('should call API and close modal on successful create', async () => {
    const newProduct = { id: 99, name: 'New Widget', price: 50, compositions: [] }
    api.post = vi.fn().mockResolvedValue({ data: newProduct })
    api.get = vi.fn().mockResolvedValue({ data: [] })

    renderWithStore()
    fireEvent.click(screen.getByText(/Novo Produto/i))
    await waitFor(() => screen.getByPlaceholderText(/Ex: Produto Alpha/i))

    fireEvent.change(screen.getByPlaceholderText(/Ex: Produto Alpha/i), {
      target: { value: 'New Widget' },
    })
    fireEvent.change(screen.getByPlaceholderText('0.00'), {
      target: { value: '50' },
    })
    fireEvent.click(screen.getByText('Criar Produto'))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/products', { name: 'New Widget', price: 50 })
    })
  })
})

describe('ProductsPage — delete flow', () => {
  it('should open confirm modal when clicking delete button', async () => {
    api.get = vi.fn().mockResolvedValue({ data: mockProducts })
    renderWithStore({ products: mockProducts, rawMaterials: mockRawMaterials })

    const deleteButtons = screen.getAllByTitle('Excluir')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/Confirmar exclusão/i)).toBeInTheDocument()
      expect(screen.getByText(/Widget Alpha/i)).toBeInTheDocument()
    })
  })

  it('should call delete API on confirm', async () => {
    api.get = vi.fn().mockResolvedValue({ data: mockProducts })
    api.delete = vi.fn().mockResolvedValue({})
    renderWithStore({ products: mockProducts, rawMaterials: mockRawMaterials })

    fireEvent.click(screen.getAllByTitle('Excluir')[0])
    await waitFor(() => screen.getByText('Excluir', { selector: 'button' }))

    const confirmBtn = screen.getAllByText('Excluir').find(el => el.tagName === 'BUTTON')
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/products/1')
    })
  })
})
