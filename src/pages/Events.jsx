import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EventCard from '../components/EventCard';
import { EmptyState, ErrorMessage, Loader } from '../components/Feedback';
import Pagination from '../components/Pagination';
import SearchFilters from '../components/SearchFilters';
import {
  fetchCategories,
  fetchEvents,
  resetFilters,
  selectEvents,
  selectEventsError,
  selectEventsStatus,
  selectFilters,
  selectPage,
  selectTotalElements,
  selectTotalPages,
  setPage,
} from '../features/events/eventsSlice';

export default function Events() {
  const dispatch = useDispatch();
  const events = useSelector(selectEvents);
  const status = useSelector(selectEventsStatus);
  const error = useSelector(selectEventsError);
  const filters = useSelector(selectFilters);
  const page = useSelector(selectPage);
  const totalPages = useSelector(selectTotalPages);
  const totalElements = useSelector(selectTotalElements);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Refetch whenever the filters or page change; abort the previous request.
  useEffect(() => {
    const request = dispatch(fetchEvents());
    return () => request.abort();
  }, [dispatch, filters, page]);

  const handlePage = (next) => {
    dispatch(setPage(next));
    window.scrollTo({ top: 0 });
  };

  return (
    <div>
      <h1>Upcoming events</h1>
      <SearchFilters />

      {status === 'failed' && <ErrorMessage message={error} onRetry={() => dispatch(fetchEvents())} />}

      {status === 'loading' && events.length === 0 && <Loader label="Finding events..." />}

      {status !== 'failed' && (status === 'succeeded' || events.length > 0) && (
        <>
          <p className="result-count" aria-live="polite">
            {totalElements.toLocaleString()} {totalElements === 1 ? 'event' : 'events'} found
            {status === 'loading' && ' (updating...)'}
          </p>
          {events.length === 0 ? (
            <EmptyState title="No events match those filters">
              <p>Try a different keyword, a wider date range, or another category.</p>
              <button type="button" className="btn btn-primary" onClick={() => dispatch(resetFilters())}>
                Clear filters
              </button>
            </EmptyState>
          ) : (
            <div className={`event-grid ${status === 'loading' ? 'is-loading' : ''}`}>
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} onChange={handlePage} />
        </>
      )}
    </div>
  );
}