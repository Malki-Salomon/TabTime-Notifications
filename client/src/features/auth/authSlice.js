import { createSlice } from "@reduxjs/toolkit";

const TOKEN_KEY = "mr_token";
const EMAIL_KEY = "mr_email";
const USER_KEY = "mr_user";

const initialState = {
  token: localStorage.getItem(TOKEN_KEY) || null,
  email: localStorage.getItem(EMAIL_KEY) || null,
  user: JSON.parse(localStorage.getItem(USER_KEY) || "null"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, { payload }) {
      state.token = payload.token ?? state.token;
      state.email = payload.email ?? state.email;
      if (payload.token) localStorage.setItem(TOKEN_KEY, payload.token);
      if (payload.email) localStorage.setItem(EMAIL_KEY, payload.email);
    },
    setUser(state, { payload }) {
      state.user = payload;
      localStorage.setItem(USER_KEY, JSON.stringify(payload));
    },
    logout(state) {
      state.token = null;
      state.email = null;
      state.user = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(EMAIL_KEY);
      localStorage.removeItem(USER_KEY);
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectToken = (s) => s.auth.token;
export const selectEmail = (s) => s.auth.email;
export const selectUser = (s) => s.auth.user;
