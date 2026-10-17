import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FormField from '../components/FormField';
import { clearAuthError, login, selectAuthError, selectCurrentUser } from '../features/auth/authSlice';
import { validateLogin } from '../utils/validators';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectCurrentUser);
  const authError = useSelector(selectAuthError);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const redirectTo = location.state?.from?.pathname || '/events';

  useEffect(() => {
    if (user) navigate(redirectTo, { replace: true });
  }, [user, navigate, redirectTo]);

  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validateLogin(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    dispatch(login({ email: form.email.trim(), password: form.password }));
  };

  return (
    <div className="auth-page">
      <h1>Log in</h1>
      {location.state?.from && <p className="notice notice-info">Log in to continue.</p>}
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField label="Email" id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} error={errors.email} />
        <FormField label="Password" id="password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={handleChange} error={errors.password} />
        {authError && (
          <p className="notice notice-error" role="alert">
            {authError}
          </p>
        )}
        <button type="submit" className="btn btn-primary btn-block">
          Log in
        </button>
      </form>
      <p className="auth-switch">
        New here? <Link to="/register" state={location.state}>Create an account</Link>
      </p>
    </div>
  );
}