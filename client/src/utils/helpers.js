export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

export function getStatusColor(station) {
  if (station.availableSlots === 0) return '#FF453A';
  if (station.availableSlots <= 1) return '#FF9F0A';
  return '#30D158';
}

export function getStatusLabel(station) {
  if (station.availableSlots === 0) return 'Full';
  if (station.availableSlots <= 1) return 'Limited';
  return 'Available';
}

export function estimateChargingTime(batteryPercent, targetPercent, batteryCapacity, chargerPower) {
  const kwhNeeded = Math.max(0, batteryCapacity * (targetPercent - batteryPercent) / 100);
  const efficiency = 0.9;
  const hours = kwhNeeded / (chargerPower * efficiency);
  const minutes = Math.max(0, Math.round(hours * 60));
  return minutes;
}

export function estimateCost(batteryPercent, targetPercent, batteryCapacity, pricePerKwh) {
  const kwhNeeded = Math.max(0, batteryCapacity * (targetPercent - batteryPercent) / 100);
  return Math.max(0, Math.round(kwhNeeded * pricePerKwh));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

export function generateTimeSlots(openingTime = '06:00', closingTime = '23:00', intervalMinutes = 30) {
  const slots = [];
  const [startH, startM] = openingTime.split(':').map(Number);
  const [endH, endM] = closingTime.split(':').map(Number);
  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current + intervalMinutes <= end) {
    const fromH = String(Math.floor(current / 60)).padStart(2, '0');
    const fromM = String(current % 60).padStart(2, '0');
    const toMin = current + intervalMinutes;
    const toH = String(Math.floor(toMin / 60)).padStart(2, '0');
    const toM = String(toMin % 60).padStart(2, '0');

    const isAvailable = Math.random() > 0.3;
    slots.push({
      from: `${fromH}:${fromM}`,
      to: `${toH}:${toM}`,
      label: `${fromH}:${fromM} – ${toH}:${toM}`,
      available: isAvailable,
    });
    current += intervalMinutes;
  }
  return slots;
}
