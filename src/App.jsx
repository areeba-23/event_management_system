import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import EventDetails from './pages/EventDetails';
import Events from './pages/Events';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Register from './pages/Register';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container">Event data from the Ticketmaster Discovery API.</div>
      </footer>
    </div>
  );
}