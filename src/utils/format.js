// Date and display helpers shared by cards, details and My Events.
const localDateOf = (event) =>
  event.localDate ? new Date(`${event.localDate}T${event.localTime || '00:00:00'}`) : null;

export function getDateParts(event) {
  const d = localDateOf(event);
  if (!d) return { month: 'TBA', day: '' };
  return { month: d.toLocaleDateString('en-US', { month: 'short' }), day: d.getDate() };
}

export function formatDate(event) {
  const d = localDateOf(event);
  if (!d) return 'Date to be announced';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(event) {
  if (!event.localTime) return null;
  return localDateOf(event).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function formatLocation(event) {
  return [event.city, event.state, event.country].filter(Boolean).join(', ');
}

export function formatPrice(event) {
  if (event.priceMin == null) return null;
  const money = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: event.currency || 'USD' }).format(n);
  return event.priceMax && event.priceMax !== event.priceMin
    ? `${money(event.priceMin)} to ${money(event.priceMax)}`
    : money(event.priceMin);
}

const NO_DATE = 8.64e15;

export function eventTimestamp(event) {
  if (event.dateTime) return new Date(event.dateTime).getTime();
  if (event.localDate) return new Date(`${event.localDate}T23:59:59`).getTime();
  return NO_DATE;
}

// An event with no known date counts as upcoming. Date-only events stay upcoming all day.
export function isUpcoming(event) {
  return eventTimestamp(event) >= Date.now();
}

export function formatDay(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// YYYY-MM-DD in the user's own time zone, for <input type="date">
export const toInputDate = (date) => date.toLocaleDateString('en-CA');
export const todayInput = () => toInputDate(new Date());
export function addDaysInput(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toInputDate(d);
}