import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FormField from '../components/FormField';
import { clearAuthError, register, selectAuthError, selectCurrentUser } from '../features/auth/authSlice';
import { validateRegister } from '../utils/validators';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectCurrentUser);
  const authError = useSelector(selectAuthError);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const redirectTo = location.state?.from?.pathname || '/events';

  useEffect(() => {
    if (user) navigate(redirectTo, { replace: true });
  }, [user, navigate, redirectTo]);

  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validateRegister(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    dispatch(register({ name: form.name.trim(), email: form.email.trim(), password: form.password }));
  };

  return (
    <div className="auth-page">
      <h1>Create your account</h1>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField label="Full name" id="name" name="name" autoComplete="name" value={form.name} onChange={handleChange} error={errors.name} />
        <FormField label="Email" id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} error={errors.email} />
        <FormField label="Password" id="password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} error={errors.password} />
        <FormField label="Confirm password" id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
        {authError && (
          <p className="notice notice-error" role="alert">
            {authError}
          </p>
        )}
        <button type="submit" className="btn btn-primary btn-block">
          Create account
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login" state={location.state}>Log in</Link>
      </p>
    </div>
  );
}