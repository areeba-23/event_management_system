import { createSlice } from '@reduxjs/toolkit';

const KEY = 'ems_registrations';

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
};

// byUser: { [userId]: [{ eventId, registeredAt, event }] }
// A snapshot of the event is saved so My Events works without refetching.
const registrationsSlice = createSlice({
  name: 'registrations',
  initialState: { byUser: load() },
  reducers: {
    registerForEvent(state, action) {
      const { userId, event } = action.payload;
      if (!state.byUser[userId]) state.byUser[userId] = [];
      const list = state.byUser[userId];
      if (list.some((r) => r.eventId === event.id)) return; // block duplicates
      list.push({ eventId: event.id, registeredAt: new Date().toISOString(), event });
    },
    cancelRegistration(state, action) {
      const { userId, eventId } = action.payload;
      if (!state.byUser[userId]) return;
      state.byUser[userId] = state.byUser[userId].filter((r) => r.eventId !== eventId);
    },
  },
});

export const { registerForEvent, cancelRegistration } = registrationsSlice.actions;

const EMPTY = [];
export const selectUserRegistrations = (state, userId) => state.registrations.byUser[userId] || EMPTY;
export const selectIsRegistered = (state, userId, eventId) =>
  Boolean(userId) && selectUserRegistrations(state, userId).some((r) => r.eventId === eventId);

export default registrationsSlice.reducer;