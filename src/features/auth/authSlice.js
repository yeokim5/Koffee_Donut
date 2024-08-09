import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
<<<<<<< HEAD
  initialState: { token: localStorage.getItem("token") || null },
=======
  initialState: { token: null },
>>>>>>> c5a6b7df98f694191c674c3f2879425a51b3af48
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken } = action.payload;
      state.token = accessToken;
<<<<<<< HEAD
      localStorage.setItem("token", accessToken);
    },
    logOut: (state, action) => {
      state.token = null;
      localStorage.removeItem("token");
=======
    },
    logOut: (state, action) => {
      state.token = null;
>>>>>>> c5a6b7df98f694191c674c3f2879425a51b3af48
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentToken = (state) => state.auth.token;
