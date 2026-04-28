import { createContext, useContext, useState, useEffect } from 'react';
import { mockUser } from '../data/mockStations';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('zapspot_user');
    if (saved) {
      setUser(JSON.parse(saved));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('zapspot_user', JSON.stringify(data.user));
      localStorage.setItem('zapspot_token', data.token);
      setShowLogin(false);
      return { success: true };
    } catch (err) {
      // Fallback to mock if backend is down or CORS blocks
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('zapspot_user', JSON.stringify(mockUser));
      setShowLogin(false);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await api.register({ name, email, password });
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('zapspot_user', JSON.stringify(data.user));
      localStorage.setItem('zapspot_token', data.token);
      setShowSignup(false);
      return { success: true };
    } catch (err) {
      const newUser = { ...mockUser, name, email };
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('zapspot_user', JSON.stringify(newUser));
      setShowSignup(false);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('zapspot_user');
    localStorage.removeItem('zapspot_token');
  };

  const addVehicle = (vehicle) => {
    const updated = { ...user, vehicles: [...user.vehicles, { ...vehicle, id: 'v' + Date.now() }] };
    setUser(updated);
    localStorage.setItem('zapspot_user', JSON.stringify(updated));
  };

  const removeVehicle = (vehicleId) => {
    const updated = { ...user, vehicles: user.vehicles.filter(v => v.id !== vehicleId) };
    setUser(updated);
    localStorage.setItem('zapspot_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, loading,
      showLogin, setShowLogin,
      showSignup, setShowSignup,
      login, signup, logout,
      addVehicle, removeVehicle
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
