import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { EmptyState } from '../components/Feedback';
import { selectCurrentUser } from '../features/auth/authSlice';
import { cancelRegistration, selectUserRegistrations } from '../features/registrations/registrationsSlice';
import { eventTimestamp, formatDate, formatDay, formatLocation, formatTime, isUpcoming } from '../utils/format';

export default function MyEvents() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const registrations = useSelector((state) => selectUserRegistrations(state, user.id));
  const [tab, setTab] = useState('upcoming');
  const [notice, setNotice] = useState(null);

  const { upcoming, completed } = useMemo(() => {
    const up = [];
    const done = [];
    registrations.forEach((r) => (isUpcoming(r.event) ? up : done).push(r));
    up.sort((a, b) => eventTimestamp(a.event) - eventTimestamp(b.event));
    done.sort((a, b) => eventTimestamp(b.event) - eventTimestamp(a.event));
    return { upcoming: up, completed: done };
  }, [registrations]);

  const handleCancel = (reg) => {
    if (!window.confirm(`Cancel your registration for ${reg.event.name}?`)) return;
    dispatch(cancelRegistration({ userId: user.id, eventId: reg.eventId }));
    setNotice(`Registration cancelled for ${reg.event.name}.`);
  };

  const list = tab === 'upcoming' ? upcoming : completed;

  return (
    <div>
      <h1>My events</h1>
      <div className="tabs" role="tablist" aria-label="My events">
        <button type="button" role="tab" aria-selected={tab === 'upcoming'} className={`tab ${tab === 'upcoming' ? 'tab-active' : ''}`} onClick={() => setTab('upcoming')}>
          Upcoming ({upcoming.length})
        </button>
        <button type="button" role="tab" aria-selected={tab === 'completed'} className={`tab ${tab === 'completed' ? 'tab-active' : ''}`} onClick={() => setTab('completed')}>
          Completed ({completed.length})
        </button>
      </div>

      {notice && (
        <p className="notice notice-info" role="status">
          {notice}
        </p>
      )}

      {list.length === 0 ? (
        <EmptyState title={tab === 'upcoming' ? 'No upcoming events' : 'No completed events yet'}>
          {tab === 'upcoming' ? (
            <>
              <p>Events you register for will show up here.</p>
              <Link to="/events" className="btn btn-primary">Browse events</Link>
            </>
          ) : (
            <p>Events you registered for appear here once their date has passed.</p>
          )}
        </EmptyState>
      ) : (
        <ul className="reg-list">
          {list.map((reg) => {
            const { event } = reg;
            const time = formatTime(event);
            return (
              <li key={reg.eventId} className="reg-item">
                {event.image ? <img src={event.image} alt="" loading="lazy" /> : <div className="reg-fallback" />}
                <div className="reg-info">
                  <h2><Link to={`/events/${event.id}`}>{event.name}</Link></h2>
                  <p className="meta">{formatDate(event)}{time ? ` at ${time}` : ''}</p>
                  <p className="meta">{[event.venueName, formatLocation(event)].filter(Boolean).join(', ')}</p>
                  <p className="meta">Registered on {formatDay(reg.registeredAt)}</p>
                </div>
                <div className="reg-actions">
                  <Link to={`/events/${event.id}`} className="btn btn-ghost">View details</Link>
                  {tab === 'upcoming' ? (
                    <button type="button" className="btn btn-danger" onClick={() => handleCancel(reg)}>
                      Cancel registration
                    </button>
                  ) : (
                    <span className="badge">Completed</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}