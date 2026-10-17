import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import eventsReducer from '../features/events/eventsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
  },
});

// Persist to localStorage (kept out of the reducers so they stay pure).
const write = (key, value) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: the app still works for this session */
  }
};

let prev = store.getState();
store.subscribe(() => {
  const next = store.getState();
  if (next.auth.users !== prev.auth.users) write('ems_users', next.auth.users);
  if (next.auth.currentUser !== prev.auth.currentUser) write('ems_session', next.auth.currentUser);
  prev = next;
});
