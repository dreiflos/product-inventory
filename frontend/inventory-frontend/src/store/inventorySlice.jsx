import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api';

export const fetchSuggestions = createAsyncThunk('inventory/fetchSuggestions', async () => {
  const response = await api.get('/production/suggested');
  return response.data;
});

export const fetchProducts = createAsyncThunk('inventory/fetchProducts', async () => {
  const response = await api.get('/products');
  return response.data;
});

export const createProduct = createAsyncThunk('inventory/createProduct', async (data) => {
  const response = await api.post('/products', data);
  return response.data;
});

export const updateProduct = createAsyncThunk('inventory/updateProduct', async ({ id, data }) => {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
});

export const deleteProduct = createAsyncThunk('inventory/deleteProduct', async (id) => {
  await api.delete(`/products/${id}`);
  return id;
});

export const addComposition = createAsyncThunk('inventory/addComposition', async ({ productId, data }) => {
  const response = await api.post(`/products/${productId}/compositions`, data);
  return { productId, composition: response.data };
});

export const removeComposition = createAsyncThunk('inventory/removeComposition', async ({ productId, compositionId }) => {
  await api.delete(`/products/${productId}/compositions/${compositionId}`);
  return { productId, compositionId };
});

export const fetchRawMaterials = createAsyncThunk('inventory/fetchRawMaterials', async () => {
  const response = await api.get('/raw-materials');
  return response.data;
});

export const createRawMaterial = createAsyncThunk('inventory/createRawMaterial', async (data) => {
  const response = await api.post('/raw-materials', data);
  return response.data;
});

export const updateRawMaterial = createAsyncThunk('inventory/updateRawMaterial', async ({ id, data }) => {
  const response = await api.put(`/raw-materials/${id}`, data);
  return response.data;
});

export const deleteRawMaterial = createAsyncThunk('inventory/deleteRawMaterial', async (id) => {
  await api.delete(`/raw-materials/${id}`);
  return id;
});

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    suggestions: [],
    products: [],
    rawMaterials: [],
    loading: false,
    actionLoading: false,
    total: 0,
    error: null,
  },
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    const setLoading = (state) => { state.loading = true; state.error = null; };
    const setActionLoading = (state) => { state.actionLoading = true; state.error = null; };
    const clearLoading = (state) => { state.loading = false; };
    const clearActionLoading = (state) => { state.actionLoading = false; };

    builder
      .addCase(fetchSuggestions.pending, setLoading)
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.loading = false;
        state.suggestions = action.payload.suggestedItems ?? [];
        state.total = action.payload.totalEstimatedValue ?? 0;
      })
      .addCase(fetchSuggestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(fetchProducts.pending, setLoading)
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(createProduct.pending, setActionLoading)
      .addCase(createProduct.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.products.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message;
      })

      .addCase(updateProduct.pending, setActionLoading)
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.actionLoading = false;
        const idx = state.products.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) state.products[idx] = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message;
      })

      .addCase(deleteProduct.pending, setActionLoading)
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.products = state.products.filter(p => p.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message;
      })

      .addCase(addComposition.pending, setActionLoading)
      .addCase(addComposition.fulfilled, (state, action) => {
        state.actionLoading = false;
        const product = state.products.find(p => p.id === action.payload.productId);
        if (product) {
          if (!product.compositions) product.compositions = [];
          product.compositions.push(action.payload.composition);
        }
      })
      .addCase(addComposition.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message;
      })

      .addCase(removeComposition.pending, setActionLoading)
      .addCase(removeComposition.fulfilled, (state, action) => {
        state.actionLoading = false;
        const product = state.products.find(p => p.id === action.payload.productId);
        if (product && product.compositions) {
          product.compositions = product.compositions.filter(c => c.id !== action.payload.compositionId);
        }
      })
      .addCase(removeComposition.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message;
      })

      .addCase(fetchRawMaterials.pending, setLoading)
      .addCase(fetchRawMaterials.fulfilled, (state, action) => {
        state.loading = false;
        state.rawMaterials = action.payload;
      })
      .addCase(fetchRawMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(createRawMaterial.pending, setActionLoading)
      .addCase(createRawMaterial.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.rawMaterials.push(action.payload);
      })
      .addCase(createRawMaterial.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message;
      })


      .addCase(updateRawMaterial.pending, setActionLoading)
      .addCase(updateRawMaterial.fulfilled, (state, action) => {
        state.actionLoading = false;
        const idx = state.rawMaterials.findIndex(m => m.id === action.payload.id);
        if (idx !== -1) state.rawMaterials[idx] = action.payload;
      })
      .addCase(updateRawMaterial.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message;
      })


      .addCase(deleteRawMaterial.pending, setActionLoading)
      .addCase(deleteRawMaterial.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.rawMaterials = state.rawMaterials.filter(m => m.id !== action.payload);
      })
      .addCase(deleteRawMaterial.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError } = inventorySlice.actions;
export default inventorySlice.reducer;
