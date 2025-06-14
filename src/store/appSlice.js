import { createSlice } from '@reduxjs/toolkit';

// A simple placeholder slice to satisfy Redux Toolkit's requirement for at least one reducer.
// Expand or replace this slice as real application state logic is implemented.
const appSlice = createSlice({
  name: 'app',
  initialState: {
    initialized: true,
  },
  reducers: {
    // Example reducer actions – currently no-ops but demonstrate standard pattern.
    setInitialized: (state, action) => {
      state.initialized = action.payload;
    },
  },
});

export const { setInitialized } = appSlice.actions;
export default appSlice.reducer;
