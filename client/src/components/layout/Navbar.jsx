import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, MapPin, User, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/offilogo.png';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, user, logout, setShowLogin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="Zapspot logo" className="brand-logo" />
          <span className="brand-text">Zapspot</span>
        </Link>

        <div className="navbar-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by city or pincode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            id="search-input"
          />
        </div>

        <div className="navbar-filter">
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="vehicle-select"
            id="vehicle-filter"
          >
            <option value="all">All Vehicles</option>
            <option value="2-wheeler">2-Wheeler</option>
            <option value="4-wheeler">4-Wheeler</option>
          </select>
          <ChevronDown size={14} className="select-chevron" />
        </div>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/map"
            className={`nav-link ${isActive('/map') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <MapPin size={15} />
            Find Stations
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>
          )}
          <Link
            to="/owner"
            className={`nav-link ${isActive('/owner') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Owner Portal
          </Link>
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <button className="btn btn-glass btn-sm user-btn" id="user-menu-btn">
                <User size={16} />
                <span className="user-name">{user?.name?.split(' ')[0]}</span>
              </button>
              <div className="user-dropdown">
                <div className="user-dropdown-inner">
                  <Link to="/dashboard" className="dropdown-item" onClick={() => {}}>My Dashboard</Link>
                  <button onClick={logout} className="dropdown-item logout-btn">Logout</button>
                </div>
              </div>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowLogin(true)}
              id="login-btn"
            >
              <User size={15} />
              Login
            </button>
          )}
        </div>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  );
}
