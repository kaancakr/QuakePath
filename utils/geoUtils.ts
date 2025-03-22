export const calculateDistance = (
  coord1: [number, number],
  coord2: [number, number]
) => {
  const R = 6371e3;
  const φ1 = (coord1[1] * Math.PI) / 180;
  const φ2 = (coord2[1] * Math.PI) / 180;
  const Δφ = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const Δλ = ((coord2[0] - coord1[0]) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const calculateZoomLevel = (distance: number) => {
  if (distance > 10000) return 10;
  if (distance > 5000) return 11;
  if (distance > 2000) return 12;
  if (distance > 1000) return 13;
  if (distance > 500) return 14;
  return 16;
};
