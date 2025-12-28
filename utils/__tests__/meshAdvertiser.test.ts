// Mock react-native before importing the module under test
const mockNativeModules: any = { MeshAdvertiser: undefined };
const mockPlatform: any = { OS: 'android' };

jest.mock('react-native', () => {
  const mod = {
    NativeModules: { MeshAdvertiser: undefined },
    Platform: { OS: 'android' },
  };
  return mod;
});

import { startMeshAdvertising, stopMeshAdvertising } from '../meshAdvertiser';
import { NativeModules, Platform } from 'react-native';

describe('meshAdvertiser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Platform.OS
    (Platform as any).OS = 'android';
    // Clear MeshAdvertiser
    (NativeModules as any).MeshAdvertiser = undefined;
  });

  describe('startMeshAdvertising', () => {
    it('should return false when Platform is not Android', async () => {
      (Platform as any).OS = 'ios';
      const result = await startMeshAdvertising('test-uuid');
      expect(result).toBe(false);
    });

    it('should return false when native module is not available', async () => {
      (Platform as any).OS = 'android';
      (NativeModules as any).MeshAdvertiser = undefined;
      
      const result = await startMeshAdvertising('test-uuid');
      expect(result).toBe(false);
    });

    it('should return false when startAdvertising is not a function', async () => {
      (Platform as any).OS = 'android';
      (NativeModules as any).MeshAdvertiser = {
        startAdvertising: null,
      };
      
      const result = await startMeshAdvertising('test-uuid');
      expect(result).toBe(false);
    });

    it('should call native startAdvertising with correct parameters', async () => {
      (Platform as any).OS = 'android';
      const mockStartAdvertising = jest.fn().mockResolvedValue(true);
      (NativeModules as any).MeshAdvertiser = {
        startAdvertising: mockStartAdvertising,
      };
      
      const serviceUuid = 'test-service-uuid';
      const localName = 'TestDevice';
      
      const result = await startMeshAdvertising(serviceUuid, localName);
      
      expect(mockStartAdvertising).toHaveBeenCalledWith(serviceUuid, localName);
      expect(result).toBe(true);
    });

    it('should call native startAdvertising without localName when not provided', async () => {
      (Platform as any).OS = 'android';
      const mockStartAdvertising = jest.fn().mockResolvedValue(true);
      (NativeModules as any).MeshAdvertiser = {
        startAdvertising: mockStartAdvertising,
      };
      
      const serviceUuid = 'test-service-uuid';
      
      const result = await startMeshAdvertising(serviceUuid);
      
      expect(mockStartAdvertising).toHaveBeenCalledWith(serviceUuid, undefined);
      expect(result).toBe(true);
    });

    it('should return false when native startAdvertising throws an error', async () => {
      (Platform as any).OS = 'android';
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const mockStartAdvertising = jest.fn().mockRejectedValue(new Error('Test error'));
      (NativeModules as any).MeshAdvertiser = {
        startAdvertising: mockStartAdvertising,
      };
      
      const result = await startMeshAdvertising('test-uuid');
      
      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it('should handle native startAdvertising returning false', async () => {
      (Platform as any).OS = 'android';
      const mockStartAdvertising = jest.fn().mockResolvedValue(false);
      (NativeModules as any).MeshAdvertiser = {
        startAdvertising: mockStartAdvertising,
      };
      
      const result = await startMeshAdvertising('test-uuid');
      
      expect(result).toBe(false);
    });
  });

  describe('stopMeshAdvertising', () => {
    it('should return false when Platform is not Android', async () => {
      (Platform as any).OS = 'ios';
      const result = await stopMeshAdvertising();
      expect(result).toBe(false);
    });

    it('should return false when native module is not available', async () => {
      (Platform as any).OS = 'android';
      (NativeModules as any).MeshAdvertiser = undefined;
      
      const result = await stopMeshAdvertising();
      expect(result).toBe(false);
    });

    it('should return false when stopAdvertising is not a function', async () => {
      (Platform as any).OS = 'android';
      (NativeModules as any).MeshAdvertiser = {
        stopAdvertising: null,
      };
      
      const result = await stopMeshAdvertising();
      expect(result).toBe(false);
    });

    it('should call native stopAdvertising successfully', async () => {
      (Platform as any).OS = 'android';
      const mockStopAdvertising = jest.fn().mockResolvedValue(true);
      (NativeModules as any).MeshAdvertiser = {
        stopAdvertising: mockStopAdvertising,
      };
      
      const result = await stopMeshAdvertising();
      
      expect(mockStopAdvertising).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when native stopAdvertising throws an error', async () => {
      (Platform as any).OS = 'android';
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const mockStopAdvertising = jest.fn().mockRejectedValue(new Error('Test error'));
      (NativeModules as any).MeshAdvertiser = {
        stopAdvertising: mockStopAdvertising,
      };
      
      const result = await stopMeshAdvertising();
      
      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it('should handle native stopAdvertising returning false', async () => {
      (Platform as any).OS = 'android';
      const mockStopAdvertising = jest.fn().mockResolvedValue(false);
      (NativeModules as any).MeshAdvertiser = {
        stopAdvertising: mockStopAdvertising,
      };
      
      const result = await stopMeshAdvertising();
      
      expect(result).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should start and stop advertising in sequence', async () => {
      (Platform as any).OS = 'android';
      const mockStart = jest.fn().mockResolvedValue(true);
      const mockStop = jest.fn().mockResolvedValue(true);
      (NativeModules as any).MeshAdvertiser = {
        startAdvertising: mockStart,
        stopAdvertising: mockStop,
      };
      
      const startResult = await startMeshAdvertising('test-uuid', 'TestDevice');
      const stopResult = await stopMeshAdvertising();
      
      expect(startResult).toBe(true);
      expect(stopResult).toBe(true);
      expect(mockStart).toHaveBeenCalledBefore(mockStop as jest.Mock);
    });

    it('should handle multiple start calls', async () => {
      (Platform as any).OS = 'android';
      const mockStart = jest.fn().mockResolvedValue(true);
      (NativeModules as any).MeshAdvertiser = {
        startAdvertising: mockStart,
      };
      
      await startMeshAdvertising('uuid1');
      await startMeshAdvertising('uuid2');
      
      expect(mockStart).toHaveBeenCalledTimes(2);
    });
  });
});
