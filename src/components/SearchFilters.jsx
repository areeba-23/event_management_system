import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  resetFilters,
  selectCategories,
  selectFilters,
  setFilters,
} from '../features/events/eventsSlice';
import { addDaysInput, todayInput } from '../utils/format';

const COUNTRIES = [
  ['', 'Any country'],
  ['US', 'United States'],
  ['CA', 'Canada'],
  ['GB', 'United Kingdom'],
  ['AU', 'Australia'],
  ['DE', 'Germany'],
  ['FR', 'France'],
  ['ES', 'Spain'],
  ['MX', 'Mexico'],
  ['AE', 'United Arab Emirates'],
];

export default function SearchFilters() {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);
  const categories = useSelector(selectCategories);

  // Text boxes keep local state and are sent to Redux after a short pause,
  // so we don't call the API on every keystroke.
  const [keyword, setKeyword] = useState(filters.keyword);
  const [city, setCity] = useState(filters.city);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setFilters({ keyword: keyword.trim(), city: city.trim() }));
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword, city, dispatch]);

  const today = todayInput();
  const inNext = (days) => filters.dateFrom === today && filters.dateTo === addDaysInput(days);
  const hasFilters = Object.values(filters).some(Boolean);

  const handleReset = () => {
    setKeyword('');
    setCity('');
    dispatch(resetFilters());
  };

  return (
    <section className="filters" aria-label="Search and filter events">
      <div className="filters-row">
        <div className="field field-grow">
          <label htmlFor="keyword">Search</label>
          <input
            id="keyword"
            type="search"
            placeholder="Artist, team, show or venue"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="city">City</label>
          <input id="city" type="text" placeholder="e.g. London" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="country">Country</label>
          <select id="country" value={filters.country} onChange={(e) => dispatch(setFilters({ country: e.target.value }))}>
            {COUNTRIES.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filters-row">
        <div className="field">
          <label htmlFor="dateFrom">From</label>
          <input
            id="dateFrom"
            type="date"
            min={today}
            value={filters.dateFrom}
            onChange={(e) => dispatch(setFilters({ dateFrom: e.target.value }))}
          />
        </div>
        <div className="field">
          <label htmlFor="dateTo">To</label>
          <input
            id="dateTo"
            type="date"
            min={filters.dateFrom || today}
            value={filters.dateTo}
            onChange={(e) => dispatch(setFilters({ dateTo: e.target.value }))}
          />
        </div>
        <div className="chips" role="group" aria-label="Quick date ranges">
          <button
            type="button"
            className={`chip ${inNext(7) ? 'chip-active' : ''}`}
            aria-pressed={inNext(7)}
            onClick={() => dispatch(setFilters({ dateFrom: today, dateTo: addDaysInput(7) }))}
          >
            Next 7 days
          </button>
          <button
            type="button"
            className={`chip ${inNext(30) ? 'chip-active' : ''}`}
            aria-pressed={inNext(30)}
            onClick={() => dispatch(setFilters({ dateFrom: today, dateTo: addDaysInput(30) }))}
          >
            Next 30 days
          </button>
          {hasFilters && (
            <button type="button" className="btn btn-ghost" onClick={handleReset}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="chips" role="group" aria-label="Categories">
        <button
          type="button"
          className={`chip ${filters.category === '' ? 'chip-active' : ''}`}
          aria-pressed={filters.category === ''}
          onClick={() => dispatch(setFilters({ category: '' }))}
        >
          All categories
        </button>
        {categories.map((name) => (
          <button
            key={name}
            type="button"
            className={`chip ${filters.category === name ? 'chip-active' : ''}`}
            aria-pressed={filters.category === name}
            onClick={() => dispatch(setFilters({ category: name }))}
          >
            {name}
          </button>
        ))}
      </div>
    </section>
  );
}