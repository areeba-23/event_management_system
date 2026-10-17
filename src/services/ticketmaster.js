// All communication with the Ticketmaster Discovery API lives in this file.
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2';
const API_KEY = import.meta.env.VITE_TM_API_KEY;

const abortError = () => new DOMException('Request aborted', 'AbortError');

// The free API key allows 2 requests/second, so space requests out a little.
let nextSlot = 0;
async function throttle(signal) {
  await Promise.resolve(); // let a synchronous abort (React StrictMode) land first
  if (signal?.aborted) throw abortError();
  const wait = Math.max(0, nextSlot - Date.now());
  nextSlot = Date.now() + wait + 450;
  if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
  if (signal?.aborted) throw abortError();
}

async function request(path, params = {}, signal) {
  if (!API_KEY) {
    throw new Error(
      'Missing API key. Add VITE_TM_API_KEY to your .env file, then restart the dev server.'
    );
  }
  await throttle(signal);

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('apikey', API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  let response;
  try {
    response = await fetch(url, { signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new Error('Could not reach Ticketmaster. Check your internet connection.');
  }

  if (response.status === 401) throw new Error('The Ticketmaster API key was rejected. Check your .env file.');
  if (response.status === 404) throw new Error('That event could not be found.');
  if (response.status === 429) throw new Error('Too many requests. Wait a few seconds and try again.');
  if (!response.ok) throw new Error(`Ticketmaster returned an error (${response.status}).`);
  return response.json();
}

// ---------- helpers that turn the nested API response into a flat object ----------

const clean = (value) => (value && value !== 'Undefined' ? value : null);

// Pick the smallest 16:9 image that is at least `minWidth` wide, else the widest one.
function pickImage(images = [], minWidth) {
  const wide = images.filter((img) => img.ratio === '16_9');
  const pool = wide.length ? wide : images;
  if (!pool.length) return null;
  const big = pool.filter((img) => img.width >= minWidth).sort((a, b) => a.width - b.width);
  if (big.length) return big[0].url;
  return [...pool].sort((a, b) => b.width - a.width)[0].url;
}

export function normalizeEvent(e) {
  const venue = e._embedded?.venues?.[0];
  const cls = e.classifications?.find((c) => c.primary) || e.classifications?.[0];
  const price = e.priceRanges?.[0];
  return {
    id: e.id,
    name: e.name,
    url: e.url || null,
    image: pickImage(e.images, 500),
    imageLarge: pickImage(e.images, 1000),
    localDate: e.dates?.start?.localDate || null,
    localTime: e.dates?.start?.localTime || null,
    dateTime: e.dates?.start?.dateTime || null,
    status: e.dates?.status?.code || null,
    category: clean(cls?.segment?.name),
    genre: clean(cls?.genre?.name),
    subGenre: clean(cls?.subGenre?.name),
    venueName: venue?.name || null,
    address: venue?.address?.line1 || null,
    city: venue?.city?.name || null,
    state: venue?.state?.name || venue?.state?.stateCode || null,
    country: venue?.country?.name || null,
    postalCode: venue?.postalCode || null,
    priceMin: price?.min ?? null,
    priceMax: price?.max ?? null,
    currency: price?.currency || null,
    info: e.info || null,
    pleaseNote: e.pleaseNote || null,
    seatmap: e.seatmap?.staticUrl || null,
    attractions: (e._embedded?.attractions || []).map((a) => a.name),
  };
}

// ---------- public API ----------

const toApiDate = (date) => date.toISOString().replace(/\.\d{3}Z$/, 'Z');

export async function getEvents(
  { keyword, category, city, country, dateFrom, dateTo, page = 0, size = 12 },
  signal
) {
  const data = await request(
    '/events.json',
    {
      keyword,
      classificationName: category,
      city,
      countryCode: country,
      startDateTime: dateFrom ? `${dateFrom}T00:00:00Z` : toApiDate(new Date()), // upcoming only
      endDateTime: dateTo ? `${dateTo}T23:59:59Z` : undefined,
      sort: 'date,asc',
      page,
      size,
    },
    signal
  );
  return {
    events: (data._embedded?.events || []).map(normalizeEvent),
    page: data.page || { size, totalElements: 0, totalPages: 0, number: 0 },
  };
}

export async function getEventById(id, signal) {
  const data = await request(`/events/${encodeURIComponent(id)}.json`, {}, signal);
  return normalizeEvent(data);
}

export async function getCategories(signal) {
  const data = await request('/classifications.json', { size: 50 }, signal);
  const seen = new Map();
  (data._embedded?.classifications || []).forEach((c) => {
    if (c.segment && clean(c.segment.name)) seen.set(c.segment.id, c.segment.name);
  });
  return [...seen.values()];
}
