import { renderHook, act } from '@testing-library/react-native';
import useDashboardViewModel from '../useDashboardModel';

describe('useDashboardViewModel', () => {
  it('should initialize with default locations', () => {
    const { result } = renderHook(() => useDashboardViewModel());
    
    expect(result.current.locations).toHaveLength(6);
    expect(result.current.locations[0].name).toBe('Ankara Kızılay Meydanı');
    expect(result.current.searchQuery).toBe('');
  });

  it('should filter locations based on search query', () => {
    const { result } = renderHook(() => useDashboardViewModel());
    
    act(() => {
      result.current.handleSearch('Kızılay');
    });
    
    expect(result.current.searchQuery).toBe('Kızılay');
    expect(result.current.locations).toHaveLength(1);
    expect(result.current.locations[0].name).toContain('Kızılay');
  });

  it('should be case insensitive when searching', () => {
    const { result } = renderHook(() => useDashboardViewModel());
    
    act(() => {
      result.current.handleSearch('kızılay');
    });
    
    expect(result.current.locations).toHaveLength(1);
    expect(result.current.locations[0].name).toContain('Kızılay');
  });

  it('should return multiple results for partial matches', () => {
    const { result } = renderHook(() => useDashboardViewModel());
    
    act(() => {
      result.current.handleSearch('Park');
    });
    
    expect(result.current.locations.length).toBeGreaterThan(0);
    result.current.locations.forEach(location => {
      expect(location.name.toLowerCase()).toContain('park');
    });
  });

  it('should return empty array for no matches', () => {
    const { result } = renderHook(() => useDashboardViewModel());
    
    act(() => {
      result.current.handleSearch('NonExistentLocation');
    });
    
    expect(result.current.locations).toHaveLength(0);
  });

  it('should return all locations for empty search query', () => {
    const { result } = renderHook(() => useDashboardViewModel());
    
    act(() => {
      result.current.handleSearch('Ankara');
    });
    
    expect(result.current.locations.length).toBeGreaterThan(0);
    
    act(() => {
      result.current.handleSearch('');
    });
    
    expect(result.current.locations).toHaveLength(6);
  });

  it('should update search query correctly', () => {
    const { result } = renderHook(() => useDashboardViewModel());
    
    act(() => {
      result.current.handleSearch('Test Query');
    });
    
    expect(result.current.searchQuery).toBe('Test Query');
    
    act(() => {
      result.current.handleSearch('Another Query');
    });
    
    expect(result.current.searchQuery).toBe('Another Query');
  });

  it('should maintain location data structure', () => {
    const { result } = renderHook(() => useDashboardViewModel());
    
    act(() => {
      result.current.handleSearch('Kızılay');
    });
    
    const location = result.current.locations[0];
    expect(location).toHaveProperty('id');
    expect(location).toHaveProperty('name');
    expect(location).toHaveProperty('address');
    expect(location).toHaveProperty('latitude');
    expect(location).toHaveProperty('longitude');
    expect(typeof location.latitude).toBe('number');
    expect(typeof location.longitude).toBe('number');
  });
});

