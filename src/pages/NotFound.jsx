import { Link } from 'react-router-dom';
import { EmptyState } from '../components/Feedback';

export default function NotFound() {
  return (
    <EmptyState title="Page not found">
      <p>That address doesn't match any page here.</p>
      <Link to="/events" className="btn btn-primary">Browse events</Link>
    </EmptyState>
  );
}