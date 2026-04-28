/**
 * TomTom Routing Service (Client)
 * 
 * Calls the Zapspot backend (/api/route) which securely proxies TomTom.
 * The TomTom API key never leaves the server.
 * 
 * Supports:
 * - Fastest route — real-time traffic aware (for speed)
 * - Shortest route — shortest distance (for battery saving)
 * - Dynamic Pathfinding geometry (road-network accurate polyline)
 * - Traffic penalty battery estimation
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch a route from backend (which calls TomTom securely)
 * @param {[number,number]} origin - [lat, lng]
 * @param {[number,number]} destination - [lat, lng]
 * @param {'fastest'|'shortest'} routeType
 */
export async function getEVRoute(origin, destination, routeType = 'fastest') {
  const res = await fetch(`${API_BASE}/route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin, destination, routeType }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to calculate route');
  return data;
}

/**
 * Fetch both fastest and shortest routes in parallel
 * Returns { fastest, shortest }
 */
export async function getBothRoutes(origin, destination) {
  const [fastest, shortest] = await Promise.all([
    getEVRoute(origin, destination, 'fastest'),
    getEVRoute(origin, destination, 'shortest'),
  ]);
  return { fastest, shortest };
}

/**
 * Traffic Penalty Algorithm
 * EV idling in gridlock burns battery on HVAC + electronics (avg 1.5kW idle draw)
 */
export function calculateTrafficBatteryPenalty(trafficDelaySeconds, idleDrawKw = 1.5) {
  const hours = trafficDelaySeconds / 3600;
  return {
    penaltyKwh: Math.round(idleDrawKw * hours * 100) / 100,
    trafficDelayMinutes: Math.round(trafficDelaySeconds / 60),
  };
}

/**
 * Estimate battery at arrival including traffic idle penalty
 */
export function estimateBatteryAtArrival(
  currentBatteryPercent,
  batteryCapacityKwh = 40.5,
  distanceKm,
  consumptionKwhPer100km = 15,
  trafficDelaySeconds = 0
) {
  const currentKwh = (currentBatteryPercent / 100) * batteryCapacityKwh;
  const drivingKwh = (parseFloat(distanceKm) * consumptionKwhPer100km) / 100;
  const { penaltyKwh } = calculateTrafficBatteryPenalty(trafficDelaySeconds);
  const totalKwh = drivingKwh + penaltyKwh;
  const remainingPercent = Math.max(0, Math.round(((currentKwh - totalKwh) / batteryCapacityKwh) * 100));
  const naivePercent = Math.max(0, Math.round(((currentKwh - drivingKwh) / batteryCapacityKwh) * 100));

  return {
    batteryAtArrivalPercent: remainingPercent,
    naiveBatteryPercent: naivePercent,
    drivingConsumptionKwh: Math.round(drivingKwh * 100) / 100,
    trafficPenaltyKwh: penaltyKwh,
    isLowBattery: remainingPercent < 15,
    isCriticalBattery: remainingPercent < 8,
  };
}

/**
 * Get color for a traffic section segment
 */
export function getTrafficColor(simpleCategory, magnitudeOfDelay = 0) {
  if (simpleCategory === 'CLOSED') return '#FF2D55';
  if (simpleCategory === 'JAM' || magnitudeOfDelay >= 3) return '#FF453A';
  if (simpleCategory === 'MODERATE' || magnitudeOfDelay === 2) return '#FF9F0A';
  if (simpleCategory === 'FREE_FLOW' || magnitudeOfDelay <= 1) return '#30D158';
  return '#0071E3';
}

/**
 * Get label + color for overall traffic severity
 */
export function getTrafficSeverityLabel(trafficDelaySeconds) {
  if (trafficDelaySeconds <= 30) return { label: 'Clear', color: '#30D158', icon: '🟢' };
  if (trafficDelaySeconds <= 120) return { label: 'Light', color: '#30D158', icon: '🟡' };
  if (trafficDelaySeconds <= 300) return { label: 'Moderate', color: '#FF9F0A', icon: '🟠' };
  if (trafficDelaySeconds <= 600) return { label: 'Heavy', color: '#FF453A', icon: '🔴' };
  return { label: 'Severe', color: '#FF2D55', icon: '🔴' };
}

/**
 * Map maneuver code → display arrow/icon
 */
export function getManeuverIcon(maneuver) {
  const m = (maneuver || '').toUpperCase();
  if (m.includes('LEFT')) return '↰';
  if (m.includes('RIGHT')) return '↱';
  if (m.includes('UTURN')) return '↻';
  if (m.includes('ROUNDABOUT')) return '↺';
  if (m === 'ARRIVE') return '🏁';
  if (m === 'DEPART') return '📍';
  return '↑';
}

/**
 * Get descriptive label for a maneuver
 */
export function getManeuverLabel(maneuver) {
  const m = (maneuver || '').toUpperCase();
  if (m.includes('SHARP_LEFT')) return 'Sharp left';
  if (m.includes('TURN_LEFT') || m.includes('KEEP_LEFT')) return 'Turn left';
  if (m.includes('SHARP_RIGHT')) return 'Sharp right';
  if (m.includes('TURN_RIGHT') || m.includes('KEEP_RIGHT')) return 'Turn right';
  if (m.includes('UTURN')) return 'Make a U-turn';
  if (m.includes('ROUNDABOUT')) return 'Take the roundabout';
  if (m === 'ARRIVE') return 'Arriving at destination';
  if (m === 'DEPART') return 'Start driving';
  return 'Continue straight';
}
