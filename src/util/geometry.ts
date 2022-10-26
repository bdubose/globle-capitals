// Constants
const EARTH_RADIUS = 6_378_137;

// Functions

// Trig
export function toDegrees(radians: number) {
  return (radians * 180) / Math.PI;
}

export function toRadians(angleDegrees: number) {
  return (angleDegrees * Math.PI) / 180.0;
}

// Linear algebra
// Polar (LatLng) to Cartesian
// Theta = lng, phi = lat
export function polarToCart({ lat, lng }: Coords) {
  const radLat = toRadians(lat);
  const radLng = toRadians(lng);
  return {
    x: Math.cos(radLng) * Math.cos(radLat),
    y: Math.sin(radLng) * Math.cos(radLat),
    z: Math.sin(radLat),
  } as Cartesian;
}

// Cartesion to Polar
export function cartToPolar({ x, y, z }: Cartesian) {
  const radLng = Math.atan(y / x);
  const radLat = Math.atan(abs({ x, y }) / z);
  return {
    lng: toDegrees(radLng),
    lat: toDegrees(radLat),
  };
}

// Cartesian dot product
export function dotProduct(v1: Cartesian, v2: Cartesian) {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

// Cartesian cross product
export function crossProduct(v1: Cartesian, v2: Cartesian) {
  return {
    x: v1.y * v2.z + v2.y * v1.z,
    y: v1.z * v2.x + v2.z * v1.x,
    z: v1.x * v2.y + v2.x * v1.y,
  } as Cartesian;
}

// Vector absolute value
export function abs(v: Record<string, number>) {
  const sum = Object.values(v).reduce((sum, i) => sum + i ** 2, 0);
  return Math.sqrt(sum);
}

// Get unit vector of vector
export function unitVector(v: Cartesian) {
  const a = abs(v);
  return {
    x: v.x / a,
    y: v.y / a,
    z: v.z / a,
  } as Cartesian;
}

// Geometry
// Distance between points
export function arcLength(v1: Cartesian, v2: Cartesian) {
  return Math.acos(dotProduct(v1, v2)) * EARTH_RADIUS;
}

// Distance from point to arc
export function pointToArc(p: Cartesian, a1: Cartesian, a2: Cartesian) {
  const cp = crossProduct(a1, a2);
  const ratio = dotProduct(p, cp) / abs(cp);
  return Math.asin(ratio) * EARTH_RADIUS;
}

// Intersection between arc and a point's perpendicular great circle
export function intersection(p1: Cartesian, a1: Cartesian, a2: Cartesian) {
  // p2 is the missing point. But we can get it from cross product.
  const n1 = crossProduct(a1, a2);
  // However, we need the unit vector
  const p2 = unitVector(n1);

  // Now for the code I copied from the internet
  const n2 = crossProduct(p1, p2);
  const l = crossProduct(n1, n2);
  const i = unitVector(l);
  return i;
}

// Closest point on arc to other point

// Relative geometry
// Arc length relative to larger arc
// Arc length relative to max possible length (half of Earth's circumference)

// // Test
// const toronto = { lat: 43.7417, lng: -79.3733 };
// const montreal = { lat: 45.5089, lng: -73.5617 };

// const ans2 = arcLength(polarToCart(toronto), polarToCart(montreal));
// console.log(Math.round(ans2 / 1000), "km");
