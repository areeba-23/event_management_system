# Doorlist - Event Management System

A React app for exploring events, viewing details, registering, and managing your registrations.
Built for Web Programming Assignment 2 with React, Redux Toolkit, React Router and the
[Ticketmaster Discovery API](https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/).

## Features

- **Authentication (simulated):** register, log in and log out. Sessions persist across refreshes using Local Storage. Forms are validated.
- **Explore events:** live data from Ticketmaster with keyword search, category browsing, city, country and date-range filters, quick "next 7 / 30 days" ranges, and pagination. Only upcoming events are shown.
- **Event details:** name, date and time, venue, address, category/genre, image, price range, description, notes, seat map and a link to buy tickets.
- **Registration:** register for an event while logged in, duplicates are blocked, success feedback is shown, and registrations can be cancelled. Registrations are stored per user.
- **My events:** registered events split into Upcoming and Completed. Upcoming ones can be cancelled.
- **Protected routes**, loading, error and empty states, and a responsive layout.

## Setup

1. Get a free API key at https://developer.ticketmaster.com/ (use the **Consumer Key**).
2. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/areeba-23/event_management_system.git
   cd event_management_system
   npm install
   ```
3. Copy `.env.example` to `.env` and paste your key:
   ```
   VITE_TM_API_KEY=your_consumer_key_here
   ```
4. Start the dev server and open the printed local URL:
   ```bash
   npm run dev
   ```

Other scripts: `npm run build` (production build), `npm run preview`, `npm run lint`.

> `.env` is git-ignored. Never commit your API key. Restart `npm run dev` after editing `.env`.

## Project structure

```
src/
  app/store.js                      configureStore + Local Storage persistence
  features/
    auth/authSlice.js               users, current user, register/login/logout
    events/eventsSlice.js           events list, filters, paging, details, categories (async thunks)
    registrations/registrationsSlice.js   per-user registrations
  services/ticketmaster.js          API calls, request throttling, response normalising
  components/                       Navbar, EventCard, SearchFilters, Pagination, FormField, ProtectedRoute, Feedback
  pages/                            Login, Register, Events, EventDetails, MyEvents, NotFound
  utils/                            date/price formatting, form validators
```

## Routes

| Path | Page | Access |
|---|---|---|
| `/login`, `/register` | Auth forms | Public |
| `/events` | Search, filter and browse | Public |
| `/events/:id` | Event details and registration | Public (log in to register) |
| `/my-events` | Your registrations | Logged in only |

## Design notes and limitations

- Redux Toolkit holds auth, events and registrations. Persistence to Local Storage happens in a store subscriber so reducers stay pure.
- Search text is debounced and in-flight requests are aborted when filters change, to respect the API limit of 2 requests/second.
- Ticketmaster does not return results beyond the first 1,000 items, so paging stops there.
- Authentication is a frontend simulation: users and passwords are kept in Local Storage in plain text. A real app would use a backend with hashed passwords.
- The API key is visible in the browser network tab at runtime, which is expected for a frontend-only app.