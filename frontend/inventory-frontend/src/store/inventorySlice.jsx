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

export const fetchRawMaterials = createAsyncThunk('inventory/fetchRawMaterials', async () => {
  const response = await api.get('/raw-materials');
  return response.data;
});

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    suggestions: [],
    products: [],
    rawMaterials: [],
    loading: false,
    total: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuggestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchSuggestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.loading = false;
        state.suggestions = action.payload.suggestedItems ?? [];
        state.total = action.payload.totalEstimatedValue ?? 0;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.suggestions = action.payload.items ?? [];
        state.total = action.payload.total ?? 0;
      })
      .addCase(fetchRawMaterials.fulfilled, (state, action) => { state.rawMaterials = action.payload; });
  },
});

export default inventorySlice.reducer;