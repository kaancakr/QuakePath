import { calculateDistance, calculateZoomLevel } from '../geoUtils';

describe('geoUtils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two coordinates correctly', () => {
      // Ankara Kızılay (39.92077, 32.85411) to Ankara Güvenpark (39.92036, 32.85342)
      const coord1: [number, number] = [32.85411, 39.92077];
      const coord2: [number, number] = [32.85342, 39.92036];
      
      const distance = calculateDistance(coord1, coord2);
      
      // Expected distance is approximately 100-150 meters
      expect(distance).toBeGreaterThan(50);
      expect(distance).toBeLessThan(200);
      expect(typeof distance).toBe('number');
    });

    it('should return 0 for same coordinates', () => {
      const coord: [number, number] = [32.85411, 39.92077];
      const distance = calculateDistance(coord, coord);
      
      expect(distance).toBe(0);
    });

    it('should calculate distance for far coordinates', () => {
      // Ankara to Istanbul approximate coordinates
      const ankara: [number, number] = [32.85411, 39.92077];
      const istanbul: [number, number] = [28.9784, 41.0082];
      
      const distance = calculateDistance(ankara, istanbul);
      
      // Expected distance is approximately 350-400 km
      expect(distance).toBeGreaterThan(300000); // 300 km
      expect(distance).toBeLessThan(500000); // 500 km
    });

    it('should handle negative coordinates', () => {
      const coord1: [number, number] = [-122.4194, 37.7749]; // San Francisco
      const coord2: [number, number] = [-74.0060, 40.7128]; // New York
      
      const distance = calculateDistance(coord1, coord2);
      
      expect(distance).toBeGreaterThan(0);
      expect(typeof distance).toBe('number');
    });

    it('should return positive distance regardless of coordinate order', () => {
      const coord1: [number, number] = [32.85411, 39.92077];
      const coord2: [number, number] = [32.85342, 39.92036];
      
      const distance1 = calculateDistance(coord1, coord2);
      const distance2 = calculateDistance(coord2, coord1);
      
      expect(distance1).toBe(distance2);
      expect(distance1).toBeGreaterThan(0);
    });
  });

  describe('calculateZoomLevel', () => {
    it('should return zoom level 10 for distances greater than 10000m', () => {
      expect(calculateZoomLevel(15000)).toBe(10);
      expect(calculateZoomLevel(20000)).toBe(10);
    });

    it('should return zoom level 11 for distances between 5000 and 10000m', () => {
      expect(calculateZoomLevel(7500)).toBe(11);
      expect(calculateZoomLevel(6000)).toBe(11);
    });

    it('should return zoom level 12 for distances between 2000 and 5000m', () => {
      expect(calculateZoomLevel(3000)).toBe(12);
      expect(calculateZoomLevel(2500)).toBe(12);
    });

    it('should return zoom level 13 for distances between 1000 and 2000m', () => {
      expect(calculateZoomLevel(1500)).toBe(13);
      expect(calculateZoomLevel(1200)).toBe(13);
    });

    it('should return zoom level 14 for distances between 500 and 1000m', () => {
      expect(calculateZoomLevel(750)).toBe(14);
      expect(calculateZoomLevel(600)).toBe(14);
    });

    it('should return zoom level 16 for distances less than 500m', () => {
      expect(calculateZoomLevel(400)).toBe(16);
      expect(calculateZoomLevel(100)).toBe(16);
      expect(calculateZoomLevel(0)).toBe(16);
    });

    it('should handle boundary values correctly', () => {
      // 10000 > 10000 is false, so it goes to next condition: 10000 > 5000 is true, returns 11
      expect(calculateZoomLevel(10000)).toBe(11);
      expect(calculateZoomLevel(10001)).toBe(10);
      expect(calculateZoomLevel(9999)).toBe(11);
      
      // 5000 > 5000 is false, so it goes to next condition: 5000 > 2000 is true, returns 12
      expect(calculateZoomLevel(5000)).toBe(12);
      expect(calculateZoomLevel(5001)).toBe(11);
      expect(calculateZoomLevel(4999)).toBe(12);
      
      // 2000 > 2000 is false, so it goes to next condition: 2000 > 1000 is true, returns 13
      expect(calculateZoomLevel(2000)).toBe(13);
      expect(calculateZoomLevel(2001)).toBe(12);
      expect(calculateZoomLevel(1999)).toBe(13);
      
      // 1000 > 1000 is false, so it goes to next condition: 1000 > 500 is true, returns 14
      expect(calculateZoomLevel(1000)).toBe(14);
      expect(calculateZoomLevel(1001)).toBe(13);
      expect(calculateZoomLevel(999)).toBe(14);
      
      // 500 > 500 is false, so it goes to default: returns 16
      expect(calculateZoomLevel(500)).toBe(16);
      expect(calculateZoomLevel(501)).toBe(14);
      expect(calculateZoomLevel(499)).toBe(16);
    });
  });
});

