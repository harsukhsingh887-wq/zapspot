import { useState, useMemo } from 'react';
import { X, Star, MapPin, Clock, Zap, Navigation, Wifi, Coffee, Car, Baby, Armchair, Bath, Loader, AlertTriangle } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { getDistance, estimateChargingTime, estimateCost, generateTimeSlots, formatCurrency } from '../../utils/helpers';
import { getBothRoutes, estimateBatteryAtArrival, getTrafficSeverityLabel } from '../../services/tomtomRouting';
import './StationDetail.css';

const amenityIcons = {
  Restroom: Bath, Cafe: Coffee, WiFi: Wifi, Parking: Car, Lounge: Armchair, 'Kids Area': Baby
};

export default function StationDetail({ station, userLocation, batteryLevel = 50, onClose, onRoutesReady }) {
  const { startBooking } = useBooking();
  const { isAuthenticated, setShowLogin } = useAuth();
  const [activeTab, setActiveTab] = useState('slots');
  const [batteryPercent, setBatteryPercent] = useState(20);
  const [targetPercent, setTargetPercent] = useState(80);
  const [selectedCharger, setSelectedCharger] = useState(
    station.chargers.find(c => c.status === 'available') || station.chargers[0]
  );
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);

  const distance = getDistance(userLocation[0], userLocation[1], station.lat, station.lng);
  const timeSlots = useMemo(() => generateTimeSlots(station.openingTime, station.closingTime), [station]);

  const chargingTime = estimateChargingTime(batteryPercent, targetPercent,
    selectedCharger?.power > 20 ? 40.5 : 3.7, selectedCharger?.power || 22);
  const cost = estimateCost(batteryPercent, targetPercent,
    selectedCharger?.power > 20 ? 40.5 : 3.7, station.pricePerKwh);

  const handleBook = () => {
    if (!isAuthenticated) { setShowLogin(true); return; }
    startBooking(station, selectedCharger);
  };

  /**
   * "Get Directions" — fetches both fastest + shortest from backend proxy,
   * passes them to StationMap to draw on the Leaflet map.
   */
  const handleGetDirections = async () => {
    setRouteLoading(true);
    setRouteError(null);
    try {
      const routes = await getBothRoutes(userLocation, [station.lat, station.lng]);
      onRoutesReady(station, routes);
      onClose();
    } catch (err) {
      console.error('[Directions]', err);
      setRouteError(err.message || 'Could not calculate route');
    } finally {
      setRouteLoading(false);
    }
  };

  return (
    <div className="station-detail" id="station-detail-panel">
      <div className="detail-overlay" onClick={onClose} />
      <div className="detail-panel glass-card-static">
        <button className="detail-close" onClick={onClose}><X size={20} /></button>

        {/* Hero */}
        <div className="detail-hero">
          <img src={station.image} alt={station.name} className="detail-hero-img" />
          <div className="detail-hero-overlay">
            <div className="detail-rating">
              <Star size={14} fill="#FF9F0A" color="#FF9F0A" />
              <span>{station.rating}</span>
            </div>
          </div>
        </div>

        <div className="detail-body">
          <h3 className="detail-name">{station.name}</h3>
          <div className="detail-meta">
            <span className="detail-address"><MapPin size={14} /> {station.address}</span>
            <span className="detail-distance"><Navigation size={14} /> {distance} km away</span>
            <span className="detail-hours"><Clock size={14} /> {station.openingTime} – {station.closingTime}</span>
          </div>

          {/* Charger selector */}
          <div className="detail-chargers">
            <label className="filter-label">Select Charger</label>
            <div className="charger-list">
              {station.chargers.map(ch => (
                <button key={ch.id}
                  className={`charger-chip ${selectedCharger?.id === ch.id ? 'selected' : ''} ${ch.status}`}
                  onClick={() => ch.status !== 'faulty' && setSelectedCharger(ch)}
                  disabled={ch.status === 'faulty'}>
                  <Zap size={12} />
                  <span>{ch.type} · {ch.power}kW</span>
                  <span className={`chip-status ${ch.status}`}>
                    {ch.status === 'available' ? '✓' : ch.status === 'occupied' ? '⏳' : '✕'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Route error */}
          {routeError && (
            <div className="route-error">
              <AlertTriangle size={14} />
              <span>{routeError}</span>
              <button className="route-error-retry" onClick={handleGetDirections}>Retry</button>
            </div>
          )}

          {/* Tabs */}
          <div className="tabs detail-tabs">
            {['slots', 'estimate', 'reviews', 'amenities'].map(t => (
              <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'slots' && (
              <div className="slots-grid">
                {timeSlots.map((slot, i) => (
                  <div key={i} className={`time-slot ${slot.available ? 'available' : 'booked'}`}>
                    <span className="slot-time">{slot.from}</span>
                    <span className="slot-status">{slot.available ? '✅' : '❌'}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'estimate' && (
              <div className="estimator">
                <div className="estimate-input">
                  <label>Current Battery %</label>
                  <div className="range-row">
                    <input type="range" min="0" max="100" value={batteryPercent}
                      onChange={e => setBatteryPercent(Number(e.target.value))} className="range-input" />
                    <span className="range-value">{batteryPercent}%</span>
                  </div>
                </div>
                <div className="estimate-input">
                  <label>Target Battery %</label>
                  <div className="range-row">
                    <input type="range" min="0" max="100" value={targetPercent}
                      onChange={e => setTargetPercent(Number(e.target.value))} className="range-input" />
                    <span className="range-value">{targetPercent}%</span>
                  </div>
                </div>
                <div className="estimate-results">
                  <div className="estimate-card glass-card-dark">
                    <Clock size={20} color="var(--color-accent)" />
                    <div><span className="estimate-value">{chargingTime} min</span><span className="estimate-label">Estimated Time</span></div>
                  </div>
                  <div className="estimate-card glass-card-dark">
                    <Zap size={20} color="#30D158" />
                    <div><span className="estimate-value">{formatCurrency(cost)}</span><span className="estimate-label">Estimated Cost</span></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-list">
                {station.reviews.length === 0
                  ? <p className="text-secondary" style={{ textAlign: 'center', padding: 20 }}>No reviews yet</p>
                  : station.reviews.map((r, i) => (
                    <div key={i} className="review-card">
                      <div className="review-header">
                        <span className="review-user">{r.user}</span>
                        <div className="review-stars">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star key={j} size={12} fill={j < r.rating ? '#FF9F0A' : 'none'} color={j < r.rating ? '#FF9F0A' : '#D1D1D6'} />
                          ))}
                        </div>
                      </div>
                      <p className="review-text">{r.text}</p>
                      <span className="review-date">{r.date}</span>
                    </div>
                  ))}
              </div>
            )}

            {activeTab === 'amenities' && (
              <div className="amenities-grid">
                {station.amenities.map(a => {
                  const Icon = amenityIcons[a] || Wifi;
                  return (
                    <div key={a} className="amenity-card glass-card-dark">
                      <Icon size={20} color="var(--color-accent)" />
                      <span>{a}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="detail-actions" style={{ display: 'flex', gap: 8 }}>
            <button
              className={`btn btn-navigate detail-navigate-btn ${routeLoading ? 'loading' : ''}`}
              onClick={handleGetDirections}
              disabled={routeLoading}
              id="get-directions-btn"
              title="Get Directions on map"
            >
              {routeLoading ? <Loader size={18} className="btn-spinner" /> : <Navigation size={18} />}
            </button>
            {station.availableSlots > 0 ? (
              <button className="btn btn-success btn-lg detail-book-btn" style={{ flex: 1 }} onClick={handleBook} id="book-now-btn">
                <Zap size={18} /> Book Now — {formatCurrency(cost)}/est
              </button>
            ) : (
              <button className="btn btn-primary btn-lg detail-book-btn" style={{ flex: 1 }} onClick={handleBook}>
                Join Waitlist
              </button>
            )}
          </div>

          <p className="directions-hint">
            <Navigation size={11} /> Click the green button to draw route on map with live traffic
          </p>
        </div>
      </div>
    </div>
  );
}
