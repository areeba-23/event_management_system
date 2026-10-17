import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import { selectIsRegistered } from '../features/registrations/registrationsSlice';
import { formatDate, formatTime, getDateParts } from '../utils/format';

export default function EventCard({ event }) {
  const user = useSelector(selectCurrentUser);
  const registered = useSelector((state) => selectIsRegistered(state, user?.id, event.id));
  const { month, day } = getDateParts(event);
  const time = formatTime(event);
  const place = [event.venueName, event.city].filter(Boolean).join(', ');

  return (
    <article className="event-card">
      <Link to={`/events/${event.id}`} className="event-card-link">
        <div className="event-card-media">
          {event.image ? (
            <img src={event.image} alt="" loading="lazy" />
          ) : (
            <div className="media-fallback">No image available</div>
          )}
          <div className="date-stub" aria-hidden="true">
            <span className="stub-month">{month}</span>
            <span className="stub-day">{day}</span>
          </div>
          {registered && <span className="badge badge-success">You're going</span>}
        </div>
        <div className="event-card-body">
          {event.category && <span className="tag">{event.category}</span>}
          <h3>{event.name}</h3>
          <p className="meta">
            {formatDate(event)}
            {time ? ` at ${time}` : ''}
          </p>
          {place && <p className="meta">{place}</p>}
        </div>
      </Link>
    </article>
  );
}