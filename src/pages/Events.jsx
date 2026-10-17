import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EventCard from '../components/EventCard';
import { EmptyState, ErrorMessage, Loader } from '../components/Feedback';
import {
  fetchEvents,
  selectEvents,
  selectEventsError,
  selectEventsStatus,
  selectFilters,
  selectPage,
  selectTotalElements,
} from '../features/events/eventsSlice';

export default function Events() {
  const dispatch = useDispatch();
  const events = useSelector(selectEvents);
  const status = useSelector(selectEventsStatus);
  const error = useSelector(selectEventsError);
  const filters = useSelector(selectFilters);
  const page = useSelector(selectPage);
  const totalElements = useSelector(selectTotalElements);

  // Refetch whenever the filters or page change; abort the previous request.
  useEffect(() => {
    const request = dispatch(fetchEvents());
    return () => request.abort();
  }, [dispatch, filters, page]);

  return (
    <div>
      <h1>Upcoming events</h1>

      {status === 'failed' && <ErrorMessage message={error} onRetry={() => dispatch(fetchEvents())} />}

      {status === 'loading' && events.length === 0 && <Loader label="Finding events..." />}

      {status !== 'failed' && (status === 'succeeded' || events.length > 0) && (
        <>
          <p className="result-count" aria-live="polite">
            {totalElements.toLocaleString()} {totalElements === 1 ? 'event' : 'events'} found
          </p>
          {events.length === 0 ? (
            <EmptyState title="No events found">
              <p>There are no upcoming events to show right now.</p>
            </EmptyState>
          ) : (
            <div className={`event-grid ${status === 'loading' ? 'is-loading' : ''}`}>
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
