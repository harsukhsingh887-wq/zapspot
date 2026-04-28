import ev1 from '../assets/evstations/ev1.jpeg';
import ev2 from '../assets/evstations/ev2.jpeg';
import ev3 from '../assets/evstations/ev3.jpeg';
import ev4 from '../assets/evstations/ev4.jpeg';
import ev5 from '../assets/evstations/ev5.jpeg';

// Generates realistic EV charging stations around a given location
// Covers all charger types, vehicle types, speeds, and amenity combos

const STATION_TEMPLATES = [
  {
    prefix: 'Tata Power SuperCharger',
    chargerTypes: ['CCS2', 'CHAdeMO'],
    vehicleTypes: ['4-wheeler'],
    speed: 'Fast',
    priceRange: [18, 22],
    slotsRange: [6, 10],
    amenities: ['Restroom', 'Cafe', 'WiFi', 'Parking', 'Lounge'],
    image: ev1,
  },
  {
    prefix: 'Ather Grid',
    chargerTypes: ['Type 2'],
    vehicleTypes: ['2-wheeler'],
    speed: 'Slow',
    priceRange: [8, 12],
    slotsRange: [3, 5],
    amenities: ['Parking', 'WiFi'],
    image: ev2,
  },
  {
    prefix: 'ChargeZone Hub',
    chargerTypes: ['CCS2', 'CHAdeMO', 'Type 2'],
    vehicleTypes: ['4-wheeler'],
    speed: 'Fast',
    priceRange: [20, 25],
    slotsRange: [6, 8],
    amenities: ['Restroom', 'Cafe', 'WiFi', 'Parking', 'Lounge'],
    image: ev3,
  },
  {
    prefix: 'EV Power Station',
    chargerTypes: ['Type 2', 'CCS2'],
    vehicleTypes: ['2-wheeler', '4-wheeler'],
    speed: 'Slow',
    priceRange: [10, 15],
    slotsRange: [3, 6],
    amenities: ['Parking'],
    image: ev4,
  },
  {
    prefix: 'GreenCharge Point',
    chargerTypes: ['Type 2', 'GB/T'],
    vehicleTypes: ['2-wheeler', '4-wheeler'],
    speed: 'Fast',
    priceRange: [14, 18],
    slotsRange: [4, 6],
    amenities: ['Parking', 'WiFi', 'Restroom'],
    image: ev5,
  },
  {
    prefix: 'ElectraGo Station',
    chargerTypes: ['CCS2', 'Type 2', 'GB/T'],
    vehicleTypes: ['4-wheeler'],
    speed: 'Fast',
    priceRange: [16, 20],
    slotsRange: [5, 8],
    amenities: ['Restroom', 'Cafe', 'Parking', 'WiFi'],
    image: ev1,
  },
  {
    prefix: 'Bolt Charge',
    chargerTypes: ['CCS2', 'CHAdeMO', 'GB/T'],
    vehicleTypes: ['4-wheeler'],
    speed: 'Fast',
    priceRange: [18, 24],
    slotsRange: [4, 6],
    amenities: ['Restroom', 'Cafe', 'Parking', 'Lounge'],
    image: ev2,
  },
  {
    prefix: 'EcoCharge Mini',
    chargerTypes: ['Type 2'],
    vehicleTypes: ['2-wheeler'],
    speed: 'Slow',
    priceRange: [8, 12],
    slotsRange: [2, 4],
    amenities: ['Parking'],
    image: ev3,
  },
  {
    prefix: 'PowerGrid Fast Hub',
    chargerTypes: ['CCS2', 'CHAdeMO', 'Type 2', 'GB/T'],
    vehicleTypes: ['2-wheeler', '4-wheeler'],
    speed: 'Fast',
    priceRange: [16, 22],
    slotsRange: [6, 10],
    amenities: ['Restroom', 'Cafe', 'WiFi', 'Parking', 'Kids Area'],
    image: ev4,
  },
  {
    prefix: 'Statiq Station',
    chargerTypes: ['CCS2', 'Type 2'],
    vehicleTypes: ['4-wheeler'],
    speed: 'Fast',
    priceRange: [18, 25],
    slotsRange: [4, 8],
    amenities: ['Restroom', 'WiFi', 'Parking', 'Lounge', 'Kids Area'],
    image: ev5,
  },
  {
    prefix: 'Kazam EV Point',
    chargerTypes: ['Type 2', 'GB/T'],
    vehicleTypes: ['2-wheeler', '4-wheeler'],
    speed: 'Slow',
    priceRange: [10, 14],
    slotsRange: [3, 5],
    amenities: ['Parking', 'Cafe'],
    image: ev1,
  },
  {
    prefix: 'Fortum Charge',
    chargerTypes: ['CCS2', 'CHAdeMO'],
    vehicleTypes: ['4-wheeler'],
    speed: 'Fast',
    priceRange: [20, 25],
    slotsRange: [4, 6],
    amenities: ['Restroom', 'Cafe', 'WiFi', 'Parking'],
    image: ev2,
  },
];

const AREA_NAMES = [
  'Main Road', 'Station Road', 'MG Road', 'Ring Road', 'Highway Plaza',
  'City Center', 'Market Square', 'Tech Park', 'Industrial Area', 'Mall Road',
  'Lake View', 'University Road', 'Bus Stand', 'Railway Station', 'Bypass Road',
  'Sector 5', 'Sector 12', 'Sector 21', 'New Colony', 'Old Town',
  'Green Park', 'Sunrise Colony', 'Model Town', 'Civil Lines', 'Cantonment',
];

const REVIEW_POOL = [
  { user: 'Rajesh K.', rating: 5, text: 'Excellent station, fast charging!', date: '2026-03-15' },
  { user: 'Priya S.', rating: 4, text: 'Good location, clean restrooms.', date: '2026-03-10' },
  { user: 'Amit V.', rating: 4, text: 'Convenient and reliable.', date: '2026-02-20' },
  { user: 'Neha R.', rating: 5, text: 'Super fast, great experience!', date: '2026-02-18' },
  { user: 'Vikram S.', rating: 3, text: 'Decent but gets crowded on weekends.', date: '2026-01-25' },
  { user: 'Deepak M.', rating: 5, text: 'Best station nearby, highly recommend!', date: '2026-01-20' },
  { user: 'Simran K.', rating: 4, text: 'Good amenities, reasonable pricing.', date: '2026-01-15' },
  { user: 'Manish T.', rating: 4, text: 'Nice facility, smooth booking.', date: '2026-01-10' },
];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMultiple(arr, min, max) {
  const count = rand(min, Math.min(max, arr.length));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const POWER_MAP = {
  'CCS2': [50, 60, 120, 150],
  'CHAdeMO': [50, 62.5],
  'Type 2': [3.3, 7.4, 11, 22],
  'GB/T': [22, 60, 80],
};

export function generateNearbyStations(lat, lng, count = 12) {
  const stations = [];
  // Spread stations in a ~15km radius
  const offsetRange = 0.15; // ~15km in each direction

  for (let i = 0; i < count; i++) {
    const template = STATION_TEMPLATES[i % STATION_TEMPLATES.length];
    const areaName = AREA_NAMES[i % AREA_NAMES.length];

    const stationLat = lat + randFloat(-offsetRange, offsetRange);
    const stationLng = lng + randFloat(-offsetRange, offsetRange);

    const totalSlots = rand(template.slotsRange[0], template.slotsRange[1]);
    const availableSlots = rand(0, totalSlots);
    const price = parseFloat(randFloat(template.priceRange[0], template.priceRange[1]).toFixed(1));

    // Generate chargers covering all types of the template
    const chargers = [];
    for (let j = 0; j < totalSlots; j++) {
      const chargerType = template.chargerTypes[j % template.chargerTypes.length];
      const powers = POWER_MAP[chargerType];
      const isAvailable = j < availableSlots;
      chargers.push({
        id: `gen-c-${i}-${j}`,
        type: chargerType,
        power: pick(powers),
        status: isAvailable ? 'available' : (Math.random() > 0.9 ? 'faulty' : 'occupied'),
        currentUser: isAvailable ? null : `User${rand(1000, 9999)}`,
      });
    }

    const reviewCount = rand(0, 3);
    const reviews = pickMultiple(REVIEW_POOL, 0, reviewCount).map(r => ({ ...r }));

    stations.push({
      _id: `gen-s-${i}-${Date.now()}`,
      name: `${template.prefix} — ${areaName}`,
      address: `${areaName}, Near Local Landmark`,
      lat: stationLat,
      lng: stationLng,
      rating: parseFloat(randFloat(3.5, 4.9).toFixed(1)),
      totalSlots,
      availableSlots,
      chargerTypes: [...template.chargerTypes],
      vehicleTypes: [...template.vehicleTypes],
      speed: template.speed,
      pricePerKwh: price,
      amenities: [...template.amenities],
      status: availableSlots === 0 ? 'full' : availableSlots <= 1 ? 'limited' : 'available',
      image: template.image,
      chargers,
      openingTime: pick(['00:00', '05:00', '06:00', '07:00', '08:00']),
      closingTime: pick(['20:00', '21:00', '22:00', '23:00', '23:59']),
      owner: `owner${rand(1, 5)}`,
      reviews,
    });
  }

  return stations;
}
