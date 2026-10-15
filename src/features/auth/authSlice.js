import { createSlice } from '@reduxjs/toolkit';

const USERS_KEY = 'ems_users';
const SESSION_KEY = 'ems_session';

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

const initialState = {
  users: load(USERS_KEY, []), // simulated "database" of registered users
  currentUser: load(SESSION_KEY, null), // logged-in user, restored on refresh
  error: null,
};

const sameEmail = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    register(state, action) {
      const { name, email, password } = action.payload;
      if (state.users.some((u) => sameEmail(u.email, email))) {
        state.error = 'An account with this email already exists.';
        return;
      }
      const user = { id: uid(), name, email, password };
      state.users.push(user);
      state.currentUser = { id: user.id, name, email }; // never keep the password in the session
      state.error = null;
    },
    login(state, action) {
      const { email, password } = action.payload;
      const user = state.users.find((u) => sameEmail(u.email, email) && u.password === password);
      if (!user) {
        state.error = 'Incorrect email or password.';
        return;
      }
      state.currentUser = { id: user.id, name: user.name, email: user.email };
      state.error = null;
    },
    logout(state) {
      state.currentUser = null;
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
});

export const { register, login, logout, clearAuthError } = authSlice.actions;
export const selectCurrentUser = (state) => state.auth.currentUser;
export const selectAuthError = (state) => state.auth.error;
export default authSlice.reducer;
