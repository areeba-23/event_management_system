const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister({ name, email, password, confirmPassword }) {
  const errors = {};
  if (name.trim().length < 2) errors.name = 'Enter your full name (at least 2 characters).';
  if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address.';
  if (password.length < 6) errors.password = 'Use at least 6 characters.';
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
    errors.password = 'Include at least one letter and one number.';
  if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.';
  return errors;
}

export function validateLogin({ email, password }) {
  const errors = {};
  if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Enter your password.';
  return errors;
}