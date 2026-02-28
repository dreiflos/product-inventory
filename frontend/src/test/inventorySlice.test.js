import { describe, it, expect, beforeEach, vi } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import inventoryReducer, {
  fetchProducts,
  fetchRawMaterials,
  fetchSuggestions,
  createProduct,
  updateProduct,
  deleteProduct,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
  clearError,
} from '../store/inventorySlice'
import api from '../api/api'
import { mockProducts, mockRawMaterials, mockSuggestions } from './mocks'

vi.mock('../api/api')

const makeStore = () =>
  configureStore({ reducer: { inventory: inventoryReducer } })

describe('inventorySlice — initial state', () => {
  it('should have correct initial state', () => {
    const store = makeStore()
    const state = store.getState().inventory
    expect(state.products).toEqual([])
    expect(state.rawMaterials).toEqual([])
    expect(state.suggestions).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.actionLoading).toBe(false)
    expect(state.total).toBe(0)
    expect(state.error).toBeNull()
  })
})

describe('inventorySlice — clearError', () => {
  it('should clear the error field', () => {
    const store = makeStore()
    store.dispatch({ type: fetchProducts.rejected.type, error: { message: 'Network error' } })
    expect(store.getState().inventory.error).toBe('Network error')

    store.dispatch(clearError())
    expect(store.getState().inventory.error).toBeNull()
  })
})


describe('inventorySlice — fetchProducts', () => {
  it('should set loading true while pending', () => {
    const store = makeStore()
    store.dispatch({ type: fetchProducts.pending.type })
    expect(store.getState().inventory.loading).toBe(true)
  })

  it('should populate products on fulfilled', async () => {
    api.get = vi.fn().mockResolvedValue({ data: mockProducts })
    const store = makeStore()
    await store.dispatch(fetchProducts())
    const state = store.getState().inventory
    expect(state.products).toHaveLength(2)
    expect(state.products[0].name).toBe('Widget Alpha')
    expect(state.loading).toBe(false)
  })

  it('should set error on rejected', async () => {
    api.get = vi.fn().mockRejectedValue(new Error('Server error'))
    const store = makeStore()
    await store.dispatch(fetchProducts())
    const state = store.getState().inventory
    expect(state.error).toBe('Server error')
    expect(state.loading).toBe(false)
  })
})

describe('inventorySlice — createProduct', () => {
  it('should add new product to list on fulfilled', async () => {
    const newProduct = { id: 3, name: 'Widget Gamma', price: 200, compositions: [] }
    api.post = vi.fn().mockResolvedValue({ data: newProduct })
    const store = makeStore()
    store.dispatch({ type: fetchProducts.fulfilled.type, payload: mockProducts })

    await store.dispatch(createProduct({ name: 'Widget Gamma', price: 200 }))
    const products = store.getState().inventory.products
    expect(products).toHaveLength(3)
    expect(products[2].name).toBe('Widget Gamma')
  })
})

describe('inventorySlice — updateProduct', () => {
  it('should replace the product in the list on fulfilled', async () => {
    const updated = { ...mockProducts[0], name: 'Widget Alpha V2', price: 175 }
    api.put = vi.fn().mockResolvedValue({ data: updated })
    const store = makeStore()
    store.dispatch({ type: fetchProducts.fulfilled.type, payload: mockProducts })

    await store.dispatch(updateProduct({ id: 1, data: { name: 'Widget Alpha V2', price: 175 } }))
    const products = store.getState().inventory.products
    expect(products[0].name).toBe('Widget Alpha V2')
    expect(products[0].price).toBe(175)
    expect(products).toHaveLength(2)
  })
})

describe('inventorySlice — deleteProduct', () => {
  it('should remove the product from the list on fulfilled', async () => {
    api.delete = vi.fn().mockResolvedValue({})
    const store = makeStore()
    store.dispatch({ type: fetchProducts.fulfilled.type, payload: mockProducts })

    await store.dispatch(deleteProduct(1))
    const products = store.getState().inventory.products
    expect(products).toHaveLength(1)
    expect(products[0].id).toBe(2)
  })
})


describe('inventorySlice — fetchRawMaterials', () => {
  it('should populate rawMaterials on fulfilled', async () => {
    api.get = vi.fn().mockResolvedValue({ data: mockRawMaterials })
    const store = makeStore()
    await store.dispatch(fetchRawMaterials())
    const state = store.getState().inventory
    expect(state.rawMaterials).toHaveLength(3)
    expect(state.rawMaterials[1].name).toBe('Aluminum')
  })
})

describe('inventorySlice — createRawMaterial', () => {
  it('should append new material to list on fulfilled', async () => {
    const newMaterial = { id: 4, name: 'Copper', stockQuantity: 50 }
    api.post = vi.fn().mockResolvedValue({ data: newMaterial })
    const store = makeStore()
    store.dispatch({ type: fetchRawMaterials.fulfilled.type, payload: mockRawMaterials })

    await store.dispatch(createRawMaterial({ name: 'Copper', stockQuantity: 50 }))
    const materials = store.getState().inventory.rawMaterials
    expect(materials).toHaveLength(4)
    expect(materials[3].name).toBe('Copper')
  })
})

describe('inventorySlice — updateRawMaterial', () => {
  it('should replace the material in the list on fulfilled', async () => {
    const updated = { ...mockRawMaterials[0], stockQuantity: 999 }
    api.put = vi.fn().mockResolvedValue({ data: updated })
    const store = makeStore()
    store.dispatch({ type: fetchRawMaterials.fulfilled.type, payload: mockRawMaterials })

    await store.dispatch(updateRawMaterial({ id: 1, data: { stockQuantity: 999 } }))
    const materials = store.getState().inventory.rawMaterials
    expect(materials[0].stockQuantity).toBe(999)
  })
})

describe('inventorySlice — deleteRawMaterial', () => {
  it('should remove the material from the list on fulfilled', async () => {
    api.delete = vi.fn().mockResolvedValue({})
    const store = makeStore()
    store.dispatch({ type: fetchRawMaterials.fulfilled.type, payload: mockRawMaterials })

    await store.dispatch(deleteRawMaterial(2))
    const materials = store.getState().inventory.rawMaterials
    expect(materials).toHaveLength(2)
    expect(materials.find(m => m.id === 2)).toBeUndefined()
  })
})

describe('inventorySlice — fetchSuggestions', () => {
  it('should populate suggestions and total on fulfilled', async () => {
    api.get = vi.fn().mockResolvedValue({ data: mockSuggestions })
    const store = makeStore()
    await store.dispatch(fetchSuggestions())
    const state = store.getState().inventory
    expect(state.suggestions).toHaveLength(2)
    expect(state.total).toBe(3400.00)
    expect(state.suggestions[0].productName).toBe('Widget Alpha')
  })

  it('should handle empty suggestions response', async () => {
    api.get = vi.fn().mockResolvedValue({
      data: { suggestedItems: [], totalEstimatedValue: 0 }
    })
    const store = makeStore()
    await store.dispatch(fetchSuggestions())
    const state = store.getState().inventory
    expect(state.suggestions).toEqual([])
    expect(state.total).toBe(0)
  })
})
