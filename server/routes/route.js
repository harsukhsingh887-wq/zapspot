/**
 * TomTom Routing Proxy — Backend Route
 * 
 * Keeps the API key secure on the server side.
 * Frontend calls /api/route instead of TomTom directly.
 * 
 * Supports:
 * - Fastest route (routeType=fastest) — real-time traffic aware
 * - Shortest route (routeType=shortest) — battery saver mode
 * - Traffic section data for color-coded polyline rendering
 * - Toll data for map markers
 */
import express from 'express';

const router = express.Router();
const TOMTOM_BASE = 'https://api.tomtom.com/routing/1/calculateRoute';

/**
 * POST /api/route
 * Body: { origin: [lat, lng], destination: [lat, lng], routeType: 'fastest' | 'shortest' }
 */
router.post('/', async (req, res) => {
  const { origin, destination, routeType = 'fastest' } = req.body;

  if (!origin || !destination || !Array.isArray(origin) || !Array.isArray(destination)) {
    return res.status(400).json({ error: 'origin and destination are required as [lat, lng] arrays' });
  }

  const apiKey = process.env.TOMTOM_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'TomTom API key not configured on server' });
  }

  const [originLat, originLng] = origin;
  const [destLat, destLng] = destination;
  const coordinates = `${originLat},${originLng}:${destLat},${destLng}`;

  // TomTom requires each sectionType as a SEPARATE param — not comma-separated
  const params = new URLSearchParams({
    key: apiKey,
    traffic: 'true',
    routeType,
    travelMode: 'car',
    instructionsType: 'text',
    language: 'en-US',
    computeTravelTimeFor: 'all',
  });
  params.append('sectionType', 'traffic');
  params.append('sectionType', 'tollRoad');

  const url = `${TOMTOM_BASE}/${coordinates}/json?${params.toString()}`;

  try {
    const tomtomRes = await fetch(url);
    const data = await tomtomRes.json();

    if (!tomtomRes.ok) {
      const msg = data?.detailedError?.message || data?.error?.description || 'TomTom API error';
      return res.status(tomtomRes.status).json({ error: msg });
    }

    if (!data.routes || data.routes.length === 0) {
      return res.status(404).json({ error: 'No route found between these locations' });
    }

    // Parse and return structured route data
    const route = data.routes[0];
    const summary = route.summary;
    const legs = route.legs || [];

    // Extract all road-network points (Dynamic Pathfinding geometry)
    const routePoints = [];
    legs.forEach(leg => {
      (leg.points || []).forEach(pt => {
        routePoints.push([pt.latitude, pt.longitude]);
      });
    });

    // Extract turn-by-turn instructions
    const instructions = [];
    legs.forEach(leg => {
      (leg.instructions || []).forEach(inst => {
        instructions.push({
          text: inst.message || inst.street || 'Continue',
          maneuver: inst.maneuver || 'STRAIGHT',
          distanceMeters: inst.routeOffsetInMeters || 0,
          travelTimeSeconds: inst.travelTimeInSeconds || 0,
          point: inst.point ? [inst.point.latitude, inst.point.longitude] : null,
          street: inst.street || '',
        });
      });
    });

    // Extract traffic + toll sections for map rendering
    const trafficSections = [];
    const tollSections = [];
    (route.sections || []).forEach(section => {
      if (section.sectionType === 'TRAFFIC') {
        trafficSections.push({
          startPointIndex: section.startPointIndex,
          endPointIndex: section.endPointIndex,
          simpleCategory: section.simpleCategory,   // JAM, MODERATE, FREE_FLOW, CLOSED
          delayInSeconds: section.delayInSeconds || 0,
          magnitudeOfDelay: section.magnitudeOfDelay || 0,
          effectiveSpeedInKmh: section.effectiveSpeedInKmh,
        });
      }
      if (section.sectionType === 'TOLL_ROAD') {
        tollSections.push({
          startPointIndex: section.startPointIndex,
          endPointIndex: section.endPointIndex,
          // Midpoint of toll section for marker placement
          midPointIndex: Math.floor((section.startPointIndex + section.endPointIndex) / 2),
        });
      }
    });

    const arrivalTime = summary.arrivalTime
      ? new Date(summary.arrivalTime).toLocaleTimeString('en-IN', {
          hour: '2-digit', minute: '2-digit', hour12: true,
        })
      : null;

    return res.json({
      routePoints,
      distanceKm: ((summary.lengthInMeters || 0) / 1000).toFixed(1),
      distanceMeters: summary.lengthInMeters || 0,
      travelTimeMin: Math.round((summary.travelTimeInSeconds || 0) / 60),
      travelTimeSeconds: summary.travelTimeInSeconds || 0,
      trafficDelaySeconds: summary.trafficDelayInSeconds || 0,
      trafficDelayMin: Math.round((summary.trafficDelayInSeconds || 0) / 60),
      arrivalTime,
      routeType,
      instructions,
      trafficSections,
      tollSections,
    });
  } catch (err) {
    console.error('[Route API] Error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch route from TomTom: ' + err.message });
  }
});

export default router;
