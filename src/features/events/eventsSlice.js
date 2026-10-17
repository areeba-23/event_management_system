import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getEvents, getEventById, getCategories } from '../../services/ticketmaster';

export const PAGE_SIZE = 12;
const MAX_RESULTS = 1000; // Ticketmaster does not return results deeper than 1,000 items

export const defaultFilters = { keyword: '', category: '', city: '', country: '', dateFrom: '', dateTo: '' };
const FALLBACK_CATEGORIES = ['Music', 'Sports', 'Arts & Theatre', 'Film', 'Miscellaneous'];

export const fetchEvents = createAsyncThunk('events/fetchEvents', async (_, { getState, signal }) => {
  const { filters, page } = getState().events;
  return getEvents({ ...filters, page, size: PAGE_SIZE }, signal);
});

export const fetchEventById = createAsyncThunk('events/fetchEventById', (id, { signal }) =>
  getEventById(id, signal)
);

export const fetchCategories = createAsyncThunk(
  'events/fetchCategories',
  (_, { signal }) => getCategories(signal),
  { condition: (_, { getState }) => getState().events.categoriesStatus === 'idle' }
);

const initialState = {
  items: [],
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
  page: 0,
  totalPages: 0,
  totalElements: 0,
  filters: defaultFilters,
  selected: null,
  detailStatus: 'idle',
  detailError: null,
  categories: FALLBACK_CATEGORIES,
  categoriesStatus: 'idle',
};

const isAbort = (action) => action.meta?.aborted || action.error?.name === 'AbortError';

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setFilters(state, action) {
      const next = { ...state.filters, ...action.payload };
      if (JSON.stringify(next) === JSON.stringify(state.filters)) return; // nothing changed
      state.filters = next;
      state.page = 0;
    },
    resetFilters(state) {
      state.filters = defaultFilters;
      state.page = 0;
    },
    setPage(state, action) {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        const { events, page } = action.payload;
        state.status = 'succeeded';
        state.items = events;
        state.totalElements = page.totalElements;
        state.totalPages = Math.min(page.totalPages, Math.floor(MAX_RESULTS / PAGE_SIZE));
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        if (isAbort(action)) return;
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchEventById.pending, (state, action) => {
        state.detailStatus = 'loading';
        state.detailError = null;
        if (state.selected?.id !== action.meta.arg) state.selected = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        if (isAbort(action)) return;
        state.detailStatus = 'failed';
        state.detailError = action.error.message;
      })
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesStatus = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesStatus = 'succeeded';
        if (action.payload.length) state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.categoriesStatus = 'failed'; // keep the built-in category list
      });
  },
});

export const { setFilters, resetFilters, setPage } = eventsSlice.actions;

export const selectEvents = (state) => state.events.items;
export const selectEventsStatus = (state) => state.events.status;
export const selectEventsError = (state) => state.events.error;
export const selectFilters = (state) => state.events.filters;
export const selectPage = (state) => state.events.page;
export const selectTotalPages = (state) => state.events.totalPages;
export const selectTotalElements = (state) => state.events.totalElements;
export const selectCategories = (state) => state.events.categories;
export const selectSelectedEvent = (state) => state.events.selected;
export const selectDetailStatus = (state) => state.events.detailStatus;
export const selectDetailError = (state) => state.events.detailError;

export default eventsSlice.reducer;
