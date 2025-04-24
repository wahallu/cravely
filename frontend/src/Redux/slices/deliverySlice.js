import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:5001/api/deliveries"; 

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  };
};

// Updated thunks with auth headers
export const fetchDeliveries = createAsyncThunk(
  'delivery/fetchDeliveries',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Authentication required. Please login.');
      }

      // Get all orders
      const response = await axios.get(
        'http://localhost:5002/api/orders', 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log("All orders fetched successfully:", response.data);
      
      // The filtering will be done in the component instead
      return response.data;
    } catch (error) {
      console.error("Error fetching deliveries:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch deliveries'
      );
    }
  }
);

export const createDelivery = createAsyncThunk("delivery/create", async (newDelivery) => {
  const response = await axios.post(BASE_URL, newDelivery, getAuthHeaders());
  return response.data;
});

export const updateDeliveryStatus = createAsyncThunk("delivery/updateStatus", async ({ id, status }) => {
  const response = await axios.put(`${BASE_URL}/${id}`, { driverStatus: status }, getAuthHeaders());
  return response.data;
});

// Rest of the slice remains the same
const deliverySlice = createSlice({
  name: "delivery",
  initialState: {
    deliveries: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeliveries.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDeliveries.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.deliveries = action.payload;
      })
      .addCase(fetchDeliveries.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createDelivery.fulfilled, (state, action) => {
        state.deliveries.push(action.payload);
      })
      .addCase(updateDeliveryStatus.fulfilled, (state, action) => {
        const index = state.deliveries.findIndex(del => del._id === action.payload._id);
        if (index !== -1) {
          state.deliveries[index] = action.payload;
        }
      });
  }
});

export default deliverySlice.reducer;
