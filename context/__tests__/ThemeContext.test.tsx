import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('should provide default light theme', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('light');
    expect(result.current.isDarkMode).toBe(false);
    expect(result.current.colors.background).toBe('#f5f5f5');
    expect(result.current.colors.text).toBe('#000000');
  });

  it('should toggle theme from light to dark', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.isDarkMode).toBe(false);

    await act(async () => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDarkMode).toBe(true);
    expect(result.current.colors.background).toBe('#121212');
    expect(result.current.colors.text).toBe('#f5f5f5');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('should toggle theme from dark to light', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    // First toggle to dark
    await act(async () => {
      result.current.toggleTheme();
    });

    expect(result.current.isDarkMode).toBe(true);

    // Then toggle back to light
    await act(async () => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
    expect(result.current.isDarkMode).toBe(false);
    expect(result.current.colors.background).toBe('#f5f5f5');
  });

  it('should set theme directly', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    await act(async () => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('should load saved theme from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('dark');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.theme).toBe('dark');
    });

    expect(result.current.isDarkMode).toBe(true);
  });

  it('should provide correct colors for dark mode', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    await act(async () => {
      result.current.setTheme('dark');
    });

    expect(result.current.colors.background).toBe('#121212');
    expect(result.current.colors.card).toBe('#1e1e1e');
    expect(result.current.colors.text).toBe('#f5f5f5');
    expect(result.current.colors.border).toBe('#333333');
  });

  it('should provide correct colors for light mode', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.colors.background).toBe('#f5f5f5');
    expect(result.current.colors.card).toBe('#ffffff');
    expect(result.current.colors.text).toBe('#000000');
    expect(result.current.colors.border).toBe('#e0e0e0');
  });

  it('should throw error when used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });

  it('should handle AsyncStorage errors gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    // Should still provide default theme
    expect(result.current.theme).toBe('light');
  });
});

