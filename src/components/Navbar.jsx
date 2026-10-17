import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '../features/auth/authSlice';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const close = () => setOpen(false);
  const handleLogout = () => {
    dispatch(logout());
    close();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/events" className="brand" onClick={close}>
          Doorlist
        </Link>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
        <nav id="main-nav" className={`nav ${open ? 'nav-open' : ''}`}>
          <NavLink to="/events" onClick={close}>
            Events
          </NavLink>
          {user && (
            <NavLink to="/my-events" onClick={close}>
              My events
            </NavLink>
          )}
          <span className="nav-spacer" />
          {user ? (
            <>
              <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>
              <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>
                Log in
              </NavLink>
              <Link to="/register" className="btn btn-primary" onClick={close}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}