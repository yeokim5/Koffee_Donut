import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("accessToken") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
    user: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken, refreshToken, user } = action.payload;
      state.token = accessToken;
      state.refreshToken = refreshToken;
      state.user = user;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000; // 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
      localStorage.setItem("tokenExpiry", oneDayFromNow);
    },
    logOut: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.error = null;

      // Clear all auth-related items from localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("tokenExpiry");
      localStorage.removeItem("visitedNotes");
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, logOut, setError, setLoading } =
  authSlice.actions;
export default authSlice.reducer;

export const selectCurrentToken = (state) => state.auth.token;
export const selectCurrentRefreshToken = (state) => state.auth.refreshToken;
