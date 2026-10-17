import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ErrorMessage, Loader } from '../components/Feedback';
import { selectCurrentUser } from '../features/auth/authSlice';
import {
  fetchEventById,
  selectDetailError,
  selectDetailStatus,
  selectSelectedEvent,
} from '../features/events/eventsSlice';
import {
  cancelRegistration,
  registerForEvent,
  selectIsRegistered,
} from '../features/registrations/registrationsSlice';
import { formatDate, formatLocation, formatPrice, formatTime, isUpcoming } from '../utils/format';

export default function EventDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectCurrentUser);
  const selected = useSelector(selectSelectedEvent);
  const status = useSelector(selectDetailStatus);
  const error = useSelector(selectDetailError);
  const [notice, setNotice] = useState(null);

  const event = selected?.id === id ? selected : null;
  const registered = useSelector((state) => selectIsRegistered(state, user?.id, id));

  useEffect(() => {
    const request = dispatch(fetchEventById(id));
    return () => request.abort();
  }, [dispatch, id]);

  if (status === 'failed' && !event) {
    return (
      <>
        <Link to="/events" className="back-link">Back to events</Link>
        <ErrorMessage message={error} onRetry={() => dispatch(fetchEventById(id))} />
      </>
    );
  }
  if (!event) return <Loader label="Loading event..." />;

  const upcoming = isUpcoming(event);
  const cancelled = event.status === 'cancelled';
  const canRegister = upcoming && !cancelled;
  const time = formatTime(event);
  const price = formatPrice(event);
  const location_ = formatLocation(event);
  const categoryLine = [event.category, event.genre, event.subGenre]
    .filter((v, i, all) => v && all.indexOf(v) === i)
    .join(' / ');

  const handleRegister = () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (registered) {
      setNotice({ type: 'info', text: 'You are already registered for this event.' });
      return;
    }
    dispatch(registerForEvent({ userId: user.id, event }));
    setNotice({ type: 'success', text: `You're registered for ${event.name}.` });
  };

  const handleCancel = () => {
    if (!window.confirm(`Cancel your registration for ${event.name}?`)) return;
    dispatch(cancelRegistration({ userId: user.id, eventId: event.id }));
    setNotice({ type: 'info', text: 'Your registration was cancelled.' });
  };

  return (
    <article className="details">
      <Link to="/events" className="back-link">Back to events</Link>

      {event.imageLarge && (
        <div className="details-hero">
          <img src={event.imageLarge} alt={event.name} />
        </div>
      )}

      <div className="details-layout">
        <div>
          {event.category && <span className="tag">{event.category}</span>}
          <h1>{event.name}</h1>
          {event.attractions.length > 0 && <p className="lede">Featuring {event.attractions.join(', ')}</p>}

          <dl className="facts">
            <div>
              <dt>Date</dt>
              <dd>{formatDate(event)}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>{time || 'To be announced'}</dd>
            </div>
            <div>
              <dt>Venue</dt>
              <dd>{event.venueName || 'To be announced'}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>
                {[event.address, location_, event.postalCode].filter(Boolean).join(', ') || 'To be announced'}
              </dd>
            </div>
            {categoryLine && (
              <div>
                <dt>Type</dt>
                <dd>{categoryLine}</dd>
              </div>
            )}
            {price && (
              <div>
                <dt>Price</dt>
                <dd>{price}</dd>
              </div>
            )}
            {event.status && (
              <div>
                <dt>Status</dt>
                <dd>{event.status}</dd>
              </div>
            )}
          </dl>

          {event.info && (
            <section>
              <h2>About this event</h2>
              <p>{event.info}</p>
            </section>
          )}
          {event.pleaseNote && (
            <section>
              <h2>Please note</h2>
              <p>{event.pleaseNote}</p>
            </section>
          )}
          {event.seatmap && (
            <section>
              <h2>Seat map</h2>
              <img className="seatmap" src={event.seatmap} alt={`Seat map for ${event.venueName || 'the venue'}`} loading="lazy" />
            </section>
          )}
        </div>

        <aside className="action-panel" aria-label="Registration">
          <h2>{registered ? "You're registered" : 'Register for this event'}</h2>
          {!canRegister && (
            <p className="notice notice-info">
              {cancelled ? 'This event has been cancelled.' : 'This event has already taken place.'}
            </p>
          )}
          {canRegister && !registered && (
            <button type="button" className="btn btn-primary btn-block" onClick={handleRegister}>
              {user ? 'Register' : 'Log in to register'}
            </button>
          )}
          {registered && (
            <>
              <p>Find it any time in <Link to="/my-events">My events</Link>.</p>
              {canRegister && (
                <button type="button" className="btn btn-danger btn-block" onClick={handleCancel}>
                  Cancel registration
                </button>
              )}
            </>
          )}
          {notice && (
            <p className={`notice notice-${notice.type}`} role="status">
              {notice.text}
            </p>
          )}
          {event.url && (
            <a className="btn btn-ghost btn-block" href={event.url} target="_blank" rel="noreferrer">
              Tickets on Ticketmaster
            </a>
          )}
        </aside>
      </div>
    </article>
  );
}