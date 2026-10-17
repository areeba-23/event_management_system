import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';

export default function ProtectedRoute({ children }) {
  const user = useSelector(selectCurrentUser);
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}