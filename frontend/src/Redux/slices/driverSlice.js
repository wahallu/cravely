import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchDriverStats = createAsyncThunk(
  'driver/fetchDriverStats',
  async (driverId) => {
    const response = await fetch(`http://localhost:5004/api/drivers/stats/${driverId}`);
    const data = await response.json();
    return data;
  }
);

export const fetchAllDrivers = createAsyncThunk(
  'driver/fetchAllDrivers',
  async () => {
    const response = await fetch('http://localhost:5004/api/drivers');
    const data = await response.json();
    return data;
  }
);

// Redux slice for driver state
const driverSlice = createSlice({
  name: 'driver',
  initialState: {
    drivers: [],
    selectedDriver: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllDrivers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllDrivers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.drivers = action.payload;
      })
      .addCase(fetchAllDrivers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchDriverStats.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDriverStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedDriver = action.payload;
      })
      .addCase(fetchDriverStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default driverSlice.reducer;
