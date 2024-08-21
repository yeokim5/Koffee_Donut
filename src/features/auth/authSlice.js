import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { token: localStorage.getItem("token") || null },
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken } = action.payload;
      state.token = accessToken;
      localStorage.setItem("token", accessToken);
    },
    logOut: (state, action) => {
      state.token = null;
      localStorage.removeItem("token");
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentToken = (state) => state.auth.token;
