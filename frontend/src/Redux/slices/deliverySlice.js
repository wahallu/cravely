import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:5001/api/deliveries"; 

// Thunks
export const fetchDeliveries = createAsyncThunk("delivery/fetchAll", async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
});

export const createDelivery = createAsyncThunk("delivery/create", async (newDelivery) => {
  const response = await axios.post(BASE_URL, newDelivery);
  return response.data;
});

export const updateDeliveryStatus = createAsyncThunk("delivery/updateStatus", async ({ id, status }) => {
  const response = await axios.put(`${BASE_URL}/${id}`, { driverStatus: status });
  return response.data;
});

// Slice
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
