import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { useToast } from '../context/ToastContext';
import { mockUser } from '../data/mockStations';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, Clock, Download, Leaf, Award, Car, Plus, Trash2, AlertTriangle, Battery, X } from 'lucide-react';
import { generateReceipt } from '../utils/receipt';
import { formatCurrency, formatDate } from '../utils/helpers';
import './Dashboard.css';

function ProgressRing({ progress, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke="rgba(0,0,0,0.06)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke="url(#gradient)" strokeWidth={strokeWidth}
        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
        className="progress-ring-circle" />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0071E3" />
          <stop offset="100%" stopColor="#30D158" />
        </linearGradient>
      </defs>
      <text x="50%" y="45%" textAnchor="middle" fill="var(--color-text-primary)"
        fontSize="24" fontWeight="600" fontFamily="Inter">{progress}%</text>
      <text x="50%" y="60%" textAnchor="middle" fill="var(--color-text-secondary)"
        fontSize="10" fontFamily="Inter">charged</text>
    </svg>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, setShowLogin, addVehicle, removeVehicle } = useAuth();
  const { bookings, cancelBooking } = useBooking();
  const [activeSection, setActiveSection] = useState('active');
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ name: '', type: '4-wheeler', batteryCapacity: 40, connector: 'CCS2' });

  const { toast } = useToast();

  const handleSOS = () => {
    // Replaced native alert with toast to prevent browser suppression
    toast.error(
      '🚨 EMERGENCY SOS DEPLOYED\n\n' +
      'Roadside assistance dispatched to your location.\n' +
      'Estimated Arrival: 15-20 Mins\n\n' + 
      'Helpline: 1800-ZAP-HELP',
      10000
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="dashboard-auth">
        <div className="container" style={{ textAlign: 'center', padding: '120px 0' }}>
          <h2>Welcome to Your Dashboard</h2>
          <p className="text-secondary" style={{ margin: '16px 0 24px' }}>Sign in to view your bookings, rewards, and charging history</p>
          <button className="btn btn-primary btn-lg" onClick={() => setShowLogin(true)}>Sign In</button>
        </div>
      </div>
    );
  }

  const activeBookings = bookings.filter(b => b.status === 'active' || b.status === 'upcoming');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const handleAddVehicle = () => {
    if (newVehicle.name) {
      addVehicle(newVehicle);
      setNewVehicle({ name: '', type: '4-wheeler', batteryCapacity: 40, connector: 'CCS2' });
      setShowAddVehicle(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h2>Hi, {user?.name?.split(' ')[0]} 👋</h2>
            <p className="text-secondary">Here's your EV charging overview</p>
          </div>
          <button className="btn btn-primary sos-btn" id="sos-btn" onClick={handleSOS}>
            <AlertTriangle size={16} />
            Emergency SOS
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid-4 dash-stats">
          <div className="glass-card-static dash-stat-card">
            <div className="stat-icon" style={{ background: 'rgba(0,113,227,0.08)' }}>
              <Zap size={20} color="#0071E3" />
            </div>
            <div className="stat-info">
              <span className="stat-number">{user?.rewards?.totalCharges || 34}</span>
              <span className="stat-label-text">Total Charges</span>
            </div>
          </div>
          <div className="glass-card-static dash-stat-card">
            <div className="stat-icon" style={{ background: 'rgba(48,209,88,0.1)' }}>
              <Leaf size={20} color="#30D158" />
            </div>
            <div className="stat-info">
              <span className="stat-number">{user?.rewards?.carbonSaved || 127.5} kg</span>
              <span className="stat-label-text">CO₂ Saved</span>
            </div>
          </div>
          <div className="glass-card-static dash-stat-card">
            <div className="stat-icon" style={{ background: 'rgba(255,159,10,0.1)' }}>
              <Award size={20} color="#FF9F0A" />
            </div>
            <div className="stat-info">
              <span className="stat-number">{user?.rewards?.points || 2450}</span>
              <span className="stat-label-text">Reward Points</span>
            </div>
          </div>
          <div className="glass-card-static dash-stat-card">
            <div className="stat-icon" style={{ background: 'rgba(0,113,227,0.08)' }}>
              <Battery size={20} color="#0071E3" />
            </div>
            <div className="stat-info">
              <span className="stat-number">{user?.rewards?.level || 'Silver'}</span>
              <span className="stat-label-text">Loyalty Tier</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="dash-main-grid">
          {/* Left Column */}
          <div className="dash-left">
            {/* Active Bookings */}
            <div className="glass-card-static dash-section">
              <div className="section-title-row">
                <h4>Active Bookings</h4>
                <span className="badge badge-accent">{activeBookings.length}</span>
              </div>

              {activeBookings.length === 0 ? (
                <p className="text-secondary" style={{ padding: '20px', textAlign: 'center' }}>No active bookings</p>
              ) : (
                activeBookings.map(b => (
                  <div key={b._id} className="booking-card">
                    {b.status === 'active' && (
                      <div className="charging-progress">
                        <ProgressRing progress={b.progress} />
                        <div className="charging-info">
                          <h4>{b.stationName}</h4>
                          <p className="text-secondary">{b.chargerType} • {b.chargerId}</p>
                          <div className="charging-stats">
                            <span><Zap size={12} /> {b.kwhDelivered}/{b.totalKwh} kWh</span>
                            <span><Clock size={12} /> ~{Math.round((1 - b.progress / 100) * 30)} min left</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {b.status === 'upcoming' && (
                      <div className="upcoming-card">
                        <div className="upcoming-info">
                          <h4>{b.stationName}</h4>
                          <p className="text-secondary">{b.date} • {b.timeSlot}</p>
                          <div className="upcoming-meta">
                            <span className="badge badge-accent">{b.chargerType}</span>
                            <span>{formatCurrency(b.cost)}</span>
                          </div>
                        </div>
                        <button className="btn btn-sm btn-secondary" onClick={() => cancelBooking(b._id)}>Cancel</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Booking History */}
            <div className="glass-card-static dash-section">
              <h4>Booking History</h4>
              <div className="history-list">
                {pastBookings.map(b => (
                  <div key={b._id} className="history-card">
                    <div className="history-info">
                      <strong>{b.stationName}</strong>
                      <span className="text-secondary">{formatDate(b.date)} • {b.timeSlot}</span>
                      <div className="history-meta">
                        <span className={`badge ${b.status === 'completed' ? 'badge-success' : 'badge-danger'}`}>
                          {b.status}
                        </span>
                        <span>{formatCurrency(b.cost)}</span>
                      </div>
                    </div>
                    {b.status === 'completed' && (
                      <button className="btn btn-sm btn-glass" onClick={() => generateReceipt(b)} title="Download Receipt">
                        <Download size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="dash-right">
            {/* Carbon Chart */}
            <div className="glass-card-static dash-section">
              <h4>Carbon Savings 🌱</h4>
              <p className="text-secondary" style={{ marginBottom: '16px', fontSize: '13px' }}>
                You saved {user?.rewards?.carbonSaved || 127.5} kg CO₂ this year
              </p>
              <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={user?.rewards?.monthlySavings || mockUser.rewards.monthlySavings}>
                  <defs>
                    <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#30D158" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#30D158" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" fontSize={12} stroke="var(--color-text-secondary)" />
                  <YAxis fontSize={12} stroke="var(--color-text-secondary)" />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid rgba(0,0,0,0.06)',
                      borderRadius: '12px',
                      fontSize: '13px'
                    }}
                  />
                  <Area type="monotone" dataKey="co2" stroke="#30D158" fill="url(#co2Grad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Saved Vehicles */}
            <div className="glass-card-static dash-section">
              <div className="section-title-row">
                <h4>My Vehicles</h4>
                <button className="btn btn-sm btn-glass" onClick={() => setShowAddVehicle(true)}>
                  <Plus size={14} /> Add
                </button>
              </div>

              {user?.vehicles?.map(v => (
                <div key={v.id} className="vehicle-card">
                  <div className="vehicle-icon">
                    <Car size={20} color="var(--color-accent)" />
                  </div>
                  <div className="vehicle-info">
                    <strong>{v.name}</strong>
                    <span className="text-secondary">{v.type} • {v.connector} • {v.batteryCapacity} kWh</span>
                  </div>
                  <button className="btn btn-icon btn-sm" onClick={() => removeVehicle(v.id)} style={{ color: 'var(--color-danger)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {showAddVehicle && (
                <div className="add-vehicle-form">
                  <input className="input-glass" placeholder="Vehicle name" value={newVehicle.name}
                    onChange={e => setNewVehicle(v => ({ ...v, name: e.target.value }))} />
                  <select className="input-glass" value={newVehicle.type}
                    onChange={e => setNewVehicle(v => ({ ...v, type: e.target.value }))}>
                    <option value="4-wheeler">4-Wheeler</option>
                    <option value="2-wheeler">2-Wheeler</option>
                  </select>
                  <select className="input-glass" value={newVehicle.connector}
                    onChange={e => setNewVehicle(v => ({ ...v, connector: e.target.value }))}>
                    <option value="CCS2">CCS2</option>
                    <option value="Type 2">Type 2</option>
                    <option value="CHAdeMO">CHAdeMO</option>
                    <option value="GB/T">GB/T</option>
                  </select>
                  <div className="step-actions" style={{ marginTop: '8px' }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => setShowAddVehicle(false)}>Cancel</button>
                    <button className="btn btn-sm btn-primary" onClick={handleAddVehicle}>Save</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
