import { useState } from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LayoutDashboard, Building2, CalendarDays, BarChart3, AlertTriangle, DollarSign, Users, Zap, TrendingUp, Power, PowerOff, Camera, Download, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { mockStations, mockOwnerData } from '../data/mockStations';
import { useBooking } from '../context/BookingContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/helpers';
import './OwnerPortal.css';

const COLORS = ['#0071E3', '#30D158', '#FF9F0A', '#FF453A', '#A78BFA', '#06B6D4'];

export default function OwnerPortal() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [ownerStations, setOwnerStations] = useState(mockStations.filter(s => s.owner === 'owner1'));
  const { enquiries, updateEnquiry } = useBooking();
  const { toast } = useToast();
  const data = mockOwnerData;

  const handleToggleCharger = (stationId, chargerId) => {
    setOwnerStations(prev => prev.map(s => {
      if (s._id !== stationId) return s;
      return {
        ...s,
        chargers: s.chargers.map(c => {
          if (c.id !== chargerId) return c;
          const newStatus = c.status === 'available' ? 'occupied' : c.status === 'faulty' ? 'faulty' : 'available';
          return { ...c, status: newStatus };
        })
      };
    }));
  };

  const handleMarkFaulty = (stationId, chargerId) => {
    setOwnerStations(prev => prev.map(s => {
      if (s._id !== stationId) return s;
      return {
        ...s,
        chargers: s.chargers.map(c =>
          c.id === chargerId ? { ...c, status: c.status === 'faulty' ? 'available' : 'faulty' } : c
        )
      };
    }));
  };

  const exportCSV = () => {
    const rows = [['Day', 'Revenue'], ...data.dailyRevenue.map(d => [d.day, d.revenue])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'zapspot_analytics.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'stations', icon: Building2, label: 'My Stations' },
    { id: 'bookings', icon: CalendarDays, label: 'Bookings' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'enquiries', icon: MessageSquare, label: 'Enquiries' },
    { id: 'faults', icon: AlertTriangle, label: 'Fault Reports' },
  ];

  return (
    <div className="owner-portal" id="owner-portal">
      {/* Sidebar */}
      <aside className="owner-sidebar">
        <div className="sidebar-brand">
          <Zap size={20} />
          <span>Owner Panel</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-link ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="owner-main">
        {/* Dashboard View */}
        {activeNav === 'dashboard' && (
          <div className="owner-view">
            <h2>Dashboard Overview</h2>
            <p className="text-secondary" style={{ marginBottom: '24px' }}>Real-time performance of your stations</p>

            {/* Revenue Cards */}
            <div className="grid-4 owner-stats">
              <div className="glass-card-static owner-stat-card">
                <DollarSign size={20} color="#30D158" />
                <div>
                  <span className="owner-stat-value">{formatCurrency(data.totalRevenue)}</span>
                  <span className="owner-stat-label">Total Revenue</span>
                </div>
              </div>
              <div className="glass-card-static owner-stat-card">
                <TrendingUp size={20} color="#0071E3" />
                <div>
                  <span className="owner-stat-value">{formatCurrency(data.monthlyRevenue)}</span>
                  <span className="owner-stat-label">This Month</span>
                </div>
              </div>
              <div className="glass-card-static owner-stat-card">
                <Users size={20} color="#FF9F0A" />
                <div>
                  <span className="owner-stat-value">{data.totalBookings.toLocaleString()}</span>
                  <span className="owner-stat-label">Total Bookings</span>
                </div>
              </div>
              <div className="glass-card-static owner-stat-card">
                <Zap size={20} color="#0071E3" />
                <div>
                  <span className="owner-stat-value">{data.activeChargers}/{data.activeChargers + data.faultyChargers}</span>
                  <span className="owner-stat-label">Active Chargers</span>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid-2 charts-row">
              <div className="glass-card-static chart-card">
                <h4>Weekly Revenue</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="day" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }} />
                    <Bar dataKey="revenue" fill="#0071E3" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card-static chart-card">
                <h4>Peak Hours</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={data.peakHours}>
                    <defs>
                      <linearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF9F0A" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#FF9F0A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="hour" fontSize={11} />
                    <YAxis fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }} />
                    <Area type="monotone" dataKey="bookings" stroke="#FF9F0A" fill="url(#peakGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Occupancy Heatmap */}
            <div className="glass-card-static chart-card">
              <h4>Occupancy Heatmap</h4>
              <div className="occupancy-grid">
                {data.occupancyData.map((d, i) => (
                  <div key={i} className="occupancy-cell">
                    <div className="occupancy-bar" style={{
                      height: `${d.occupancy}%`,
                      background: d.occupancy > 80 ? '#FF453A' : d.occupancy > 60 ? '#FF9F0A' : '#30D158'
                    }}></div>
                    <span className="occupancy-label">{d.hour}</span>
                    <span className="occupancy-value">{d.occupancy}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stations View */}
        {activeNav === 'stations' && (
          <div className="owner-view">
            <h2>My Stations</h2>
            <p className="text-secondary" style={{ marginBottom: '24px' }}>Manage your charging stations and chargers</p>

            {ownerStations.map(station => (
              <div key={station._id} className="glass-card-static station-mgmt-card">
                <div className="station-mgmt-header">
                  <div>
                    <h4>{station.name}</h4>
                    <p className="text-secondary">{station.address}</p>
                  </div>
                  <span className={`badge badge-${station.status === 'available' ? 'success' : station.status === 'limited' ? 'warning' : 'danger'}`}>
                    {station.availableSlots}/{station.totalSlots} available
                  </span>
                </div>

                <div className="charger-mgmt-grid">
                  {station.chargers.map(charger => (
                    <div key={charger.id} className={`charger-mgmt-card ${charger.status}`}>
                      <div className="charger-mgmt-info">
                        <strong>{charger.type}</strong>
                        <span>{charger.power} kW</span>
                        <span className={`status-dot ${charger.status}`}>{charger.status}</span>
                      </div>
                      <div className="charger-mgmt-actions">
                        <button
                          className={`btn btn-sm ${charger.status === 'available' ? 'btn-success' : 'btn-secondary'}`}
                          onClick={() => handleToggleCharger(station._id, charger.id)}
                          title={charger.status === 'available' ? 'Turn Off' : 'Turn On'}
                        >
                          {charger.status === 'available' ? <Power size={14} /> : <PowerOff size={14} />}
                        </button>
                        <button
                          className={`btn btn-sm ${charger.status === 'faulty' ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => handleMarkFaulty(station._id, charger.id)}
                          title={charger.status === 'faulty' ? 'Mark Fixed' : 'Mark Faulty'}
                        >
                          <AlertTriangle size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bookings View */}
        {activeNav === 'bookings' && (
          <div className="owner-view">
            <h2>Recent Bookings</h2>
            <p className="text-secondary" style={{ marginBottom: '24px' }}>All bookings across your stations</p>

            <div className="glass-card-static" style={{ padding: '16px', borderRadius: '20px' }}>
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Station</th>
                    <th>User</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'BK-1001', station: 'Hall Gate', user: 'Rajesh K.', date: '18 Apr', time: '10:00', amount: 114, status: 'Active' },
                    { id: 'BK-1002', station: 'GT Road', user: 'Priya S.', date: '18 Apr', time: '11:30', amount: 165, status: 'Upcoming' },
                    { id: 'BK-1003', station: 'Airport Road', user: 'Amit V.', date: '17 Apr', time: '14:00', amount: 210, status: 'Completed' },
                    { id: 'BK-1004', station: 'Hall Gate', user: 'Neha R.', date: '17 Apr', time: '09:00', amount: 95, status: 'Completed' },
                    { id: 'BK-1005', station: 'Wagah Rd', user: 'Deepak M.', date: '16 Apr', time: '16:30', amount: 180, status: 'Completed' },
                  ].map(b => (
                    <tr key={b.id}>
                      <td><strong>{b.id}</strong></td>
                      <td>{b.station}</td>
                      <td>{b.user}</td>
                      <td>{b.date}</td>
                      <td>{b.time}</td>
                      <td>{formatCurrency(b.amount)}</td>
                      <td>
                        <span className={`badge badge-${b.status === 'Active' ? 'accent' : b.status === 'Upcoming' ? 'warning' : 'success'}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics View */}
        {activeNav === 'analytics' && (
          <div className="owner-view">
            <div className="analytics-header">
              <div>
                <h2>Analytics</h2>
                <p className="text-secondary">Usage patterns and revenue insights</p>
              </div>
              <button className="btn btn-primary" onClick={exportCSV} id="export-csv-btn">
                <Download size={16} />
                Export CSV
              </button>
            </div>

            <div className="grid-2 charts-row" style={{ marginTop: '24px' }}>
              <div className="glass-card-static chart-card">
                <h4>Revenue Trend</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="day" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }} />
                    <Bar dataKey="revenue" fill="#0071E3" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card-static chart-card">
                <h4>Charger Type Distribution</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'CCS2', value: 45 },
                        { name: 'Type 2', value: 25 },
                        { name: 'CHAdeMO', value: 18 },
                        { name: 'GB/T', value: 12 },
                      ]}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={100}
                      paddingAngle={4} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[0, 1, 2, 3].map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Enquiries View */}
        {activeNav === 'enquiries' && (
          <div className="owner-view">
            <h2>User Enquiries</h2>
            <p className="text-secondary" style={{ marginBottom: '24px' }}>Review user complaints for missed sessions and compensate accordingly</p>

            {enquiries.length === 0 ? (
              <div className="glass-card-static" style={{ padding: '40px', textAlign: 'center', borderRadius: '20px' }}>
                <MessageSquare size={40} color="#6E6E73" style={{ marginBottom: '12px' }} />
                <p className="text-secondary">No enquiries yet. Users can submit enquiries when they miss their charging sessions.</p>
              </div>
            ) : (
              enquiries.map(enq => (
                <div key={enq._id} className="glass-card-static" style={{ padding: '20px', borderRadius: '20px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '14px', marginBottom: '4px' }}>{enq.stationName}</h4>
                      <p className="text-secondary" style={{ fontSize: '12px' }}>Booking: {enq.bookingId} • {enq.date}</p>
                    </div>
                    <span className={`badge badge-${enq.status === 'pending' ? 'warning' : enq.status === 'approved' ? 'success' : 'danger'}`}>
                      {enq.status === 'pending' ? 'Pending' : enq.status === 'approved' ? 'Compensated' : 'Rejected'}
                    </span>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', marginBottom: '12px' }}>
                    <p style={{ fontSize: '13px', color: '#374151' }}>"{enq.message}"</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>Amount: {formatCurrency(enq.cost)}</span>
                    {enq.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-sm btn-success" onClick={() => {
                          updateEnquiry(enq._id, { status: 'approved' });
                          toast.success(`Compensation approved! ₹${enq.cost} refund will be processed to the user.`);
                        }}>
                          <CheckCircle size={14} /> Approve Refund
                        </button>
                        <button className="btn btn-sm btn-secondary" onClick={() => {
                          updateEnquiry(enq._id, { status: 'rejected' });
                          toast.error('Enquiry rejected. No refund will be issued.');
                        }}>
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', fontStyle: 'italic', color: enq.status === 'approved' ? '#059669' : '#DC2626' }}>
                        {enq.status === 'approved' ? '✅ Refund processed' : '❌ Refund denied'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Faults View */}
        {activeNav === 'faults' && (
          <div className="owner-view">
            <h2>Fault Reports</h2>
            <p className="text-secondary" style={{ marginBottom: '24px' }}>Chargers that need attention</p>

            {ownerStations.flatMap(s =>
              s.chargers.filter(c => c.status === 'faulty').map(c => (
                <div key={c.id} className="glass-card-static fault-card">
                  <div className="fault-info">
                    <AlertTriangle size={20} color="#FF453A" />
                    <div>
                      <strong>{c.type} • {c.power}kW — {c.id}</strong>
                      <p className="text-secondary">{s.name}</p>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-primary" onClick={() => handleMarkFaulty(s._id, c.id)}>
                    Mark as Fixed
                  </button>
                </div>
              ))
            )}

            {ownerStations.every(s => s.chargers.every(c => c.status !== 'faulty')) && (
              <div className="glass-card-static" style={{ padding: '40px', textAlign: 'center', borderRadius: '20px' }}>
                <p className="text-secondary">🎉 No faulty chargers! Everything is running smoothly.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
