import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import MapFinder from './pages/MapFinder';
import Dashboard from './pages/Dashboard';
import OwnerPortal from './pages/OwnerPortal';
import LoginModal from './components/auth/LoginModal';
import SignupModal from './components/auth/SignupModal';
import BookingModal from './components/booking/BookingModal';
import './App.css';

function App() {
  return (
    <AuthProvider>
    <ToastProvider>
      <BookingProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="app-main">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/map" element={<MapFinder />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/owner" element={<OwnerPortal />} />
              </Routes>
            </main>
            <LoginModal />
            <SignupModal />
            <BookingModal />
          </div>
        </Router>
      </BookingProvider>
    </ToastProvider>
    </AuthProvider>
  );
}

export default App;
