import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const { ipcRenderer } = window.require('electron');

export const fetchCircles = createAsyncThunk(
  'circle/fetchCircles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ipcRenderer.invoke('getCircles');
      if (!response || !response.circles || !Array.isArray(response.circles)) {
        throw new Error('Invalid response from server');
      }
      return response.circles;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCircleDetails = createAsyncThunk(
  'circle/fetchCircleDetails',
  async (circleId, { rejectWithValue }) => {
    try {
      const response = await ipcRenderer.invoke('getCircleDetails', circleId);
      if (!response || !response.members) {
        throw new Error('Invalid circle details response from server');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const setCurrentCircle = createAsyncThunk(
  'circle/setCurrentCircle',
  async (circleId, { dispatch, rejectWithValue }) => {
    try {
      await ipcRenderer.invoke('setCurrentCircle', circleId);
      dispatch(fetchCircleDetails(circleId));
      return circleId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const circleSlice = createSlice({
  name: 'circle',
  initialState: {
    circles: [],
    currentCircle: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCircles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCircles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.circles = action.payload;
      })
      .addCase(fetchCircles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchCircleDetails.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCircleDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentCircle = action.payload;
      })
      .addCase(fetchCircleDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(setCurrentCircle.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // the actual currentCircle will be updated by fetchCircleDetails
      });
  },
});

export default circleSlice.reducer;