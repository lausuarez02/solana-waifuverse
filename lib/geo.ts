export const toRad = (d: number) => d * Math.PI / 180;
export const toDeg = (r: number) => r * 180 / Math.PI;

// Haversine formula to calculate distance between two lat/lng points in meters
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export function haversineMeters(a: {lat: number; lng: number}, b: {lat: number; lng: number}) {
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const s = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Calculate compass bearing from point A to point B (0-360 degrees)
export function bearingDeg(a: {lat: number; lng: number}, b: {lat: number; lng: number}) {
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δλ = toRad(b.lng - a.lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1)*Math.sin(φ2) - Math.sin(φ1)*Math.cos(φ2)*Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360; // 0..360°
}

// Calculate relative angle between bearing and heading (-180 to 180)
export function relAngleDeg(bearing: number, heading: number) {
  let d = bearing - heading; // both 0..360
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d; // -180..180
}

// Check if user is inside spawn radius
export function insideRadius(
  userLat: number,
  userLng: number,
  spawnLat: number,
  spawnLng: number,
  radius: number
): boolean {
  const distance = haversineDistance(userLat, userLng, spawnLat, spawnLng);
  return distance <= radius;
}

// Format distance for display
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
