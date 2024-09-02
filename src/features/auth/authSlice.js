import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie"; // Import js-cookie

const authSlice = createSlice({
  name: "auth",
  initialState: { token: null },
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken } = action.payload;
      state.token = accessToken;
      // Store token in cookies
      Cookies.set("token", accessToken); // Set cookie to expire in 1 day
      // Optionally clear local storage if using cookies
      localStorage.removeItem("token");
    },
    logOut: (state) => {
      state.token = null;
      Cookies.remove("token"); // Remove token from cookies
      localStorage.removeItem("token"); // Clear local storage if needed
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentToken = (state) => state.auth.token;
