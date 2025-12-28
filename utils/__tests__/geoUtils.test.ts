import { calculateDistance, calculateZoomLevel } from '../geoUtils';

describe('geoUtils', () => {
  describe('calculateDistance', () => {
    describe('Basic functionality', () => {
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

      it('should return positive distance regardless of coordinate order', () => {
        const coord1: [number, number] = [32.85411, 39.92077];
        const coord2: [number, number] = [32.85342, 39.92036];
        
        const distance1 = calculateDistance(coord1, coord2);
        const distance2 = calculateDistance(coord2, coord1);
        
        expect(distance1).toBe(distance2);
        expect(distance1).toBeGreaterThan(0);
      });
    });

    describe('Edge cases and special locations', () => {
      it('should handle coordinates at the North Pole', () => {
        const northPole: [number, number] = [0, 90];
        const coord: [number, number] = [0, 89]; // 1 degree south
        
        const distance = calculateDistance(northPole, coord);
        
        // 1 degree of latitude ≈ 111 km
        expect(distance).toBeGreaterThan(110000);
        expect(distance).toBeLessThan(112000);
      });

      it('should handle coordinates at the South Pole', () => {
        const southPole: [number, number] = [0, -90];
        const coord: [number, number] = [0, -89]; // 1 degree north
        
        const distance = calculateDistance(southPole, coord);
        
        expect(distance).toBeGreaterThan(110000);
        expect(distance).toBeLessThan(112000);
      });

      it('should handle coordinates on the equator', () => {
        const coord1: [number, number] = [0, 0];
        const coord2: [number, number] = [1, 0]; // 1 degree east
        
        const distance = calculateDistance(coord1, coord2);
        
        // At equator, 1 degree longitude ≈ 111 km
        expect(distance).toBeGreaterThan(110000);
        expect(distance).toBeLessThan(112000);
      });

      it('should handle coordinates crossing the International Date Line', () => {
        const coord1: [number, number] = [179.9, 0];
        const coord2: [number, number] = [-179.9, 0];
        
        const distance = calculateDistance(coord1, coord2);
        
        // Should calculate shortest distance (about 0.2 degrees ≈ 22 km)
        expect(distance).toBeGreaterThan(20000);
        expect(distance).toBeLessThan(25000);
      });

      it('should handle coordinates crossing the equator', () => {
        const coord1: [number, number] = [0, 1]; // North of equator
        const coord2: [number, number] = [0, -1]; // South of equator
        
        const distance = calculateDistance(coord1, coord2);
        
        // 2 degrees of latitude ≈ 222 km
        expect(distance).toBeGreaterThan(220000);
        expect(distance).toBeLessThan(224000);
      });

      it('should handle coordinates crossing the prime meridian', () => {
        const coord1: [number, number] = [-1, 0];
        const coord2: [number, number] = [1, 0];
        
        const distance = calculateDistance(coord1, coord2);
        
        // 2 degrees longitude at equator ≈ 222 km
        expect(distance).toBeGreaterThan(220000);
        expect(distance).toBeLessThan(224000);
      });

      it('should calculate distance for antipodal points (opposite sides of globe)', () => {
        const coord1: [number, number] = [0, 0];
        const coord2: [number, number] = [180, 0]; // Opposite side
        
        const distance = calculateDistance(coord1, coord2);
        
        // Should be approximately half the Earth's circumference
        const expectedDistance = Math.PI * 6371e3; // ~20,015 km
        expect(distance).toBeGreaterThan(20000000);
        expect(distance).toBeLessThan(20020000);
      });
    });

    describe('Precision and small distances', () => {
      it('should handle very small distances accurately', () => {
        const coord1: [number, number] = [32.85411, 39.92077];
        const coord2: [number, number] = [32.85412, 39.92077]; // ~1 meter difference
        
        const distance = calculateDistance(coord1, coord2);
        
        expect(distance).toBeGreaterThan(0);
        expect(distance).toBeLessThan(100); // Should be less than 100 meters
      });

      it('should handle coordinates with high precision', () => {
        const coord1: [number, number] = [32.854111111, 39.920777777];
        const coord2: [number, number] = [32.854111112, 39.920777778];
        
        const distance = calculateDistance(coord1, coord2);
        
        expect(distance).toBeGreaterThanOrEqual(0);
        expect(typeof distance).toBe('number');
      });

      it('should maintain precision for medium distances', () => {
        // Test with known distance: 1 degree latitude ≈ 111 km
        const coord1: [number, number] = [0, 0];
        const coord2: [number, number] = [0, 1];
        
        const distance = calculateDistance(coord1, coord2);
        
        expect(distance).toBeGreaterThan(110000);
        expect(distance).toBeLessThan(112000);
      });
    });

    describe('Negative coordinates', () => {
      it('should handle negative coordinates correctly', () => {
        const coord1: [number, number] = [-122.4194, 37.7749]; // San Francisco
        const coord2: [number, number] = [-74.0060, 40.7128]; // New York
        
        const distance = calculateDistance(coord1, coord2);
        
        expect(distance).toBeGreaterThan(0);
        expect(typeof distance).toBe('number');
        // San Francisco to New York is approximately 4100 km
        expect(distance).toBeGreaterThan(4000000);
        expect(distance).toBeLessThan(4200000);
      });

      it('should handle coordinates in southern hemisphere', () => {
        const coord1: [number, number] = [151.2093, -33.8688]; // Sydney
        const coord2: [number, number] = [144.9631, -37.8136]; // Melbourne
        
        const distance = calculateDistance(coord1, coord2);
        
        expect(distance).toBeGreaterThan(0);
        // Sydney to Melbourne is approximately 700-800 km
        expect(distance).toBeGreaterThan(700000);
        expect(distance).toBeLessThan(800000);
      });
    });

    describe('Invalid inputs and error handling', () => {
      it('should handle NaN coordinates', () => {
        const coord1: [number, number] = [NaN, 39.92077];
        const coord2: [number, number] = [32.85411, 39.92077];
        
        const distance = calculateDistance(coord1, coord2);
        
        expect(Number.isNaN(distance)).toBe(true);
      });

      it('should handle Infinity coordinates', () => {
        const coord1: [number, number] = [Infinity, 39.92077];
        const coord2: [number, number] = [32.85411, 39.92077];
        
        const distance = calculateDistance(coord1, coord2);
        
        expect(Number.isFinite(distance)).toBe(false);
      });

      it('should handle coordinates out of valid range', () => {
        const coord1: [number, number] = [200, 100]; // Invalid longitude/latitude
        const coord2: [number, number] = [32.85411, 39.92077];
        
        const distance = calculateDistance(coord1, coord2);
        
        // Function should still return a number (may be incorrect, but shouldn't crash)
        expect(typeof distance).toBe('number');
      });
    });

    describe('Real-world accuracy tests', () => {
      it('should calculate accurate distance for known city pairs', () => {
        // London to Paris: approximately 344 km
        const london: [number, number] = [-0.1276, 51.5074];
        const paris: [number, number] = [2.3522, 48.8566];
        
        const distance = calculateDistance(london, paris);
        
        expect(distance).toBeGreaterThan(340000);
        expect(distance).toBeLessThan(350000);
      });

      it('should calculate accurate distance for transatlantic cities', () => {
        // New York to London: approximately 5570 km
        const newYork: [number, number] = [-74.0060, 40.7128];
        const london: [number, number] = [-0.1276, 51.5074];
        
        const distance = calculateDistance(newYork, london);
        
        expect(distance).toBeGreaterThan(5500000);
        expect(distance).toBeLessThan(5650000);
      });
    });
  });

  describe('calculateZoomLevel', () => {
    describe('Basic functionality', () => {
      it('should return zoom level 10 for distances greater than 10000m', () => {
        expect(calculateZoomLevel(15000)).toBe(10);
        expect(calculateZoomLevel(20000)).toBe(10);
        expect(calculateZoomLevel(50000)).toBe(10);
      });

      it('should return zoom level 11 for distances between 5000 and 10000m', () => {
        expect(calculateZoomLevel(7500)).toBe(11);
        expect(calculateZoomLevel(6000)).toBe(11);
        expect(calculateZoomLevel(5001)).toBe(11);
      });

      it('should return zoom level 12 for distances between 2000 and 5000m', () => {
        expect(calculateZoomLevel(3000)).toBe(12);
        expect(calculateZoomLevel(2500)).toBe(12);
        expect(calculateZoomLevel(2001)).toBe(12);
      });

      it('should return zoom level 13 for distances between 1000 and 2000m', () => {
        expect(calculateZoomLevel(1500)).toBe(13);
        expect(calculateZoomLevel(1200)).toBe(13);
        expect(calculateZoomLevel(1001)).toBe(13);
      });

      it('should return zoom level 14 for distances between 500 and 1000m', () => {
        expect(calculateZoomLevel(750)).toBe(14);
        expect(calculateZoomLevel(600)).toBe(14);
        expect(calculateZoomLevel(501)).toBe(14);
      });

      it('should return zoom level 16 for distances less than 500m', () => {
        expect(calculateZoomLevel(400)).toBe(16);
        expect(calculateZoomLevel(100)).toBe(16);
        expect(calculateZoomLevel(0)).toBe(16);
        expect(calculateZoomLevel(1)).toBe(16);
        expect(calculateZoomLevel(499)).toBe(16);
      });
    });

    describe('Boundary values', () => {
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

      it('should handle exact boundary values with precision', () => {
        expect(calculateZoomLevel(10000.0001)).toBe(10);
        expect(calculateZoomLevel(10000.0)).toBe(11);
        expect(calculateZoomLevel(5000.0001)).toBe(11);
        expect(calculateZoomLevel(5000.0)).toBe(12);
        expect(calculateZoomLevel(2000.0001)).toBe(12);
        expect(calculateZoomLevel(2000.0)).toBe(13);
        expect(calculateZoomLevel(1000.0001)).toBe(13);
        expect(calculateZoomLevel(1000.0)).toBe(14);
        expect(calculateZoomLevel(500.0001)).toBe(14);
        expect(calculateZoomLevel(500.0)).toBe(16);
      });
    });

    describe('Edge cases and special values', () => {
      it('should handle very large distances', () => {
        expect(calculateZoomLevel(100000)).toBe(10);
        expect(calculateZoomLevel(1000000)).toBe(10);
        expect(calculateZoomLevel(10000000)).toBe(10);
      });

      it('should handle very small distances', () => {
        expect(calculateZoomLevel(0.1)).toBe(16);
        expect(calculateZoomLevel(0.01)).toBe(16);
        expect(calculateZoomLevel(0.001)).toBe(16);
      });

      it('should handle decimal/fractional distances', () => {
        expect(calculateZoomLevel(7500.5)).toBe(11);
        expect(calculateZoomLevel(3000.25)).toBe(12);
        expect(calculateZoomLevel(1500.75)).toBe(13);
        expect(calculateZoomLevel(750.33)).toBe(14);
        expect(calculateZoomLevel(250.99)).toBe(16);
      });

      it('should handle negative distances', () => {
        // Negative values should fall through to default (16)
        expect(calculateZoomLevel(-100)).toBe(16);
        expect(calculateZoomLevel(-1000)).toBe(16);
        expect(calculateZoomLevel(-5000)).toBe(16);
      });

      it('should handle NaN input', () => {
        const result = calculateZoomLevel(NaN);
        // NaN comparisons are all false, so it should return default (16)
        expect(result).toBe(16);
      });

      it('should handle Infinity input', () => {
        expect(calculateZoomLevel(Infinity)).toBe(10);
        expect(calculateZoomLevel(-Infinity)).toBe(16);
      });

      it('should handle very precise decimal values', () => {
        expect(calculateZoomLevel(10000.0000001)).toBe(10);
        expect(calculateZoomLevel(5000.0000001)).toBe(11);
        expect(calculateZoomLevel(2000.0000001)).toBe(12);
        expect(calculateZoomLevel(1000.0000001)).toBe(13);
        expect(calculateZoomLevel(500.0000001)).toBe(14);
      });
    });

    describe('Real-world distance scenarios', () => {
      it('should return appropriate zoom for walking distances', () => {
        expect(calculateZoomLevel(100)).toBe(16); // 100m - very close
        expect(calculateZoomLevel(500)).toBe(16); // 500m - close
        expect(calculateZoomLevel(800)).toBe(14); // 800m - medium close
      });

      it('should return appropriate zoom for driving distances', () => {
        expect(calculateZoomLevel(2000)).toBe(13); // 2km - neighborhood
        expect(calculateZoomLevel(5000)).toBe(12); // 5km - city district
        expect(calculateZoomLevel(10000)).toBe(11); // 10km - city area
      });

      it('should return appropriate zoom for regional distances', () => {
        expect(calculateZoomLevel(50000)).toBe(10); // 50km - regional
        expect(calculateZoomLevel(100000)).toBe(10); // 100km - large region
      });
    });
  });
});

