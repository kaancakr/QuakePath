import { meshRouter } from '../MeshRouter';
import { NativeModules, NativeEventEmitter } from 'react-native';
import { v4 as uuid } from 'uuid';

// Mock dependencies - need to create mock before module import
const mockNearbyMeshModule = {
  startMesh: jest.fn(),
  send: jest.fn(),
};

const mockEmitter = {
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

jest.mock('react-native', () => {
  const actualMock = {
    NativeModules: {
      get NearbyMesh() {
        return mockNearbyMeshModule;
      },
    },
    NativeEventEmitter: jest.fn(() => mockEmitter),
  };
  return actualMock;
});

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

describe('MeshRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset meshRouter state
    meshRouter.nodeId = '';
    meshRouter.peers.clear();
    meshRouter.cache.clear();
    
    // Reset mocks
    mockNearbyMeshModule.startMesh.mockResolvedValue('test-node-id');
    mockNearbyMeshModule.send.mockImplementation(() => {});
    mockEmitter.addListener.mockClear();
    mockEmitter.removeListener.mockClear();
  });

  describe('start', () => {
    it('should initialize the mesh router and set nodeId', async () => {
      await meshRouter.start();
      
      expect(mockNearbyMeshModule.startMesh).toHaveBeenCalled();
      expect(meshRouter.nodeId).toBe('test-node-id');
    });

    it('should register PeerConnected event listener', async () => {
      await meshRouter.start();
      
      expect(mockEmitter.addListener).toHaveBeenCalledWith(
        'PeerConnected',
        expect.any(Function)
      );
    });

    it('should register PeerDisconnected event listener', async () => {
      await meshRouter.start();
      
      expect(mockEmitter.addListener).toHaveBeenCalledWith(
        'PeerDisconnected',
        expect.any(Function)
      );
    });

    it('should register MeshInbound event listener', async () => {
      await meshRouter.start();
      
      expect(mockEmitter.addListener).toHaveBeenCalledWith(
        'MeshInbound',
        expect.any(Function)
      );
    });

    it('should add peer when PeerConnected event fires', async () => {
      await meshRouter.start();
      
      const peerConnectedHandler = mockEmitter.addListener.mock.calls.find(
        (call: any[]) => call[0] === 'PeerConnected'
      )?.[1];
      
      expect(peerConnectedHandler).toBeDefined();
      peerConnectedHandler('peer-id-123');
      
      expect(meshRouter.peers.has('peer-id-123')).toBe(true);
    });

    it('should remove peer when PeerDisconnected event fires', async () => {
      await meshRouter.start();
      meshRouter.peers.add('peer-id-123');
      
      const peerDisconnectedHandler = mockEmitter.addListener.mock.calls.find(
        (call: any[]) => call[0] === 'PeerDisconnected'
      )?.[1];
      
      expect(peerDisconnectedHandler).toBeDefined();
      peerDisconnectedHandler('peer-id-123');
      
      expect(meshRouter.peers.has('peer-id-123')).toBe(false);
    });

    it('should handle MeshInbound messages', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      await meshRouter.start();
      
      const meshInboundHandler = mockEmitter.addListener.mock.calls.find(
        (call: any[]) => call[0] === 'MeshInbound'
      )?.[1];
      
      const testMessage = {
        id: 'msg-123',
        source: 'source-id',
        hop: 0,
        ttl: Date.now() + 5000,
        payload: { type: 'test' },
      };
      
      meshInboundHandler(JSON.stringify(testMessage));
      
      expect(meshRouter.cache.has('msg-123')).toBe(true);
      consoleLogSpy.mockRestore();
    });
  });

  describe('send', () => {
    beforeEach(async () => {
      await meshRouter.start();
      meshRouter.peers.add('peer-1');
      meshRouter.peers.add('peer-2');
    });

    it('should create message with correct structure', () => {
      const payload = { type: 'test', content: 'hello' };
      meshRouter.send(payload);
      
      expect(mockNearbyMeshModule.send).toHaveBeenCalled();
      const sentMessage = JSON.parse(mockNearbyMeshModule.send.mock.calls[0][1]);
      
      expect(sentMessage.id).toBe('mock-uuid-123');
      expect(sentMessage.source).toBe('test-node-id');
      expect(sentMessage.payload).toEqual(payload);
      expect(sentMessage.hop).toBe(0);
      expect(sentMessage.ttl).toBeGreaterThan(Date.now());
    });

    it('should include destination when provided', () => {
      const payload = { type: 'test' };
      meshRouter.send(payload, 'target-peer');
      
      const sentMessage = JSON.parse(mockNearbyMeshModule.send.mock.calls[0][1]);
      expect(sentMessage.destination).toBe('target-peer');
    });

    it('should forward message to all peers', () => {
      meshRouter.send({ type: 'test' });
      
      expect(mockNearbyMeshModule.send).toHaveBeenCalledTimes(2);
      expect(mockNearbyMeshModule.send).toHaveBeenCalledWith('peer-1', expect.any(String));
      expect(mockNearbyMeshModule.send).toHaveBeenCalledWith('peer-2', expect.any(String));
    });

    it('should not send when no peers are connected', () => {
      meshRouter.peers.clear();
      meshRouter.send({ type: 'test' });
      
      expect(mockNearbyMeshModule.send).not.toHaveBeenCalled();
    });
  });

  describe('onReceive', () => {
    beforeEach(async () => {
      await meshRouter.start();
      meshRouter.peers.add('peer-1');
    });

    it('should ignore duplicate messages', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const message: any = {
        id: 'msg-123',
        source: 'source-id',
        hop: 0,
        ttl: Date.now() + 5000,
        payload: { type: 'test' },
      };
      
      meshRouter.onReceive(message);
      meshRouter.onReceive(message); // Duplicate
      
      expect(mockNearbyMeshModule.send).toHaveBeenCalledTimes(1); // Only forwarded once
      consoleLogSpy.mockRestore();
    });

    it('should ignore expired messages', () => {
      const message: any = {
        id: 'msg-expired',
        source: 'source-id',
        hop: 0,
        ttl: Date.now() - 1000, // Expired
        payload: { type: 'test' },
      };
      
      meshRouter.onReceive(message);
      
      expect(mockNearbyMeshModule.send).not.toHaveBeenCalled();
    });

    it('should deliver message to self when destination matches', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const message: any = {
        id: 'msg-123',
        source: 'source-id',
        destination: 'test-node-id',
        hop: 0,
        ttl: Date.now() + 5000,
        payload: { type: 'test' },
      };
      
      meshRouter.onReceive(message);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[MeshRouter] Delivering payload to self',
        message.payload
      );
      consoleLogSpy.mockRestore();
    });

    it('should deliver message when no destination specified', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const message: any = {
        id: 'msg-123',
        source: 'source-id',
        hop: 0,
        ttl: Date.now() + 5000,
        payload: { type: 'test' },
      };
      
      meshRouter.onReceive(message);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[MeshRouter] Delivering payload to self',
        message.payload
      );
      consoleLogSpy.mockRestore();
    });

    it('should not deliver message when destination is different', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const message: any = {
        id: 'msg-123',
        source: 'source-id',
        destination: 'other-node-id',
        hop: 0,
        ttl: Date.now() + 5000,
        payload: { type: 'test' },
      };
      
      meshRouter.onReceive(message);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[MeshRouter] Message not for me, dst=',
        'other-node-id',
        'nodeId=',
        'test-node-id'
      );
      consoleLogSpy.mockRestore();
    });

    it('should increment hop count', () => {
      const message: any = {
        id: 'msg-123',
        source: 'source-id',
        hop: 2,
        ttl: Date.now() + 5000,
        payload: { type: 'test' },
      };
      
      meshRouter.onReceive(message);
      
      const forwardedMessage = JSON.parse(mockNearbyMeshModule.send.mock.calls[0][1]);
      expect(forwardedMessage.hop).toBe(3);
    });

    it('should stop forwarding after MAX_HOPS', () => {
      const message: any = {
        id: 'msg-123',
        source: 'source-id',
        hop: 8, // MAX_HOPS is 8
        ttl: Date.now() + 5000,
        payload: { type: 'test' },
      };
      
      meshRouter.onReceive(message);
      
      // Should not forward when hop >= MAX_HOPS
      expect(mockNearbyMeshModule.send).not.toHaveBeenCalled();
    });

    it('should forward message to other peers', () => {
      meshRouter.peers.add('source-id'); // Add source as peer
      meshRouter.peers.add('peer-2');
      
      const message: any = {
        id: 'msg-123',
        source: 'source-id',
        hop: 0,
        ttl: Date.now() + 5000,
        payload: { type: 'test' },
      };
      
      meshRouter.onReceive(message);
      
      // Should forward to peer-2 but not to source-id
      expect(mockNearbyMeshModule.send).toHaveBeenCalledTimes(1);
      expect(mockNearbyMeshModule.send).toHaveBeenCalledWith('peer-2', expect.any(String));
    });

    it('should add message to cache', () => {
      const message: any = {
        id: 'msg-123',
        source: 'source-id',
        hop: 0,
        ttl: Date.now() + 5000,
        payload: { type: 'test' },
      };
      
      meshRouter.onReceive(message);
      
      expect(meshRouter.cache.has('msg-123')).toBe(true);
    });
  });

  describe('forward', () => {
    beforeEach(async () => {
      await meshRouter.start();
    });

    it('should forward message to all peers', () => {
      meshRouter.peers.add('peer-1');
      meshRouter.peers.add('peer-2');
      meshRouter.peers.add('peer-3');
      
      const message: any = {
        id: 'msg-123',
        source: 'source-id',
        hop: 0,
        ttl: Date.now() + 5000,
        payload: { type: 'test' },
      };
      
      meshRouter.forward(message);
      
      expect(mockNearbyMeshModule.send).toHaveBeenCalledTimes(3);
      expect(mockNearbyMeshModule.send).toHaveBeenCalledWith('peer-1', JSON.stringify(message));
      expect(mockNearbyMeshModule.send).toHaveBeenCalledWith('peer-2', JSON.stringify(message));
      expect(mockNearbyMeshModule.send).toHaveBeenCalledWith('peer-3', JSON.stringify(message));
    });

    it('should not forward when no peers', () => {
      const message: any = {
        id: 'msg-123',
        source: 'source-id',
        hop: 0,
        ttl: Date.now() + 5000,
        payload: { type: 'test' },
      };
      
      meshRouter.forward(message);
      
      expect(mockNearbyMeshModule.send).not.toHaveBeenCalled();
    });
  });

  describe('deliver', () => {
    it('should log delivered payload', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const payload = { type: 'emergency', message: 'Help!' };
      
      meshRouter.deliver(payload);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('📩 MESH MESSAGE:', payload);
      consoleLogSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    it('should handle messages at TTL boundary', () => {
      const message: any = {
        id: 'msg-boundary',
        source: 'source-id',
        hop: 0,
        ttl: Date.now(), // Exactly now
        payload: { type: 'test' },
      };
      
      meshRouter.onReceive(message);
      
      // Should be ignored as expired
      expect(mockNearbyMeshModule.send).not.toHaveBeenCalled();
    });

    it('should handle very high hop counts', () => {
      const message: any = {
        id: 'msg-high-hop',
        source: 'source-id',
        hop: 100,
        ttl: Date.now() + 5000,
        payload: { type: 'test' },
      };
      
      meshRouter.onReceive(message);
      
      // Should not forward (exceeds MAX_HOPS)
      expect(mockNearbyMeshModule.send).not.toHaveBeenCalled();
    });

    it('should handle empty payload', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const message: any = {
        id: 'msg-empty',
        source: 'source-id',
        hop: 0,
        ttl: Date.now() + 5000,
        payload: {},
      };
      
      meshRouter.onReceive(message);
      
      expect(meshRouter.cache.has('msg-empty')).toBe(true);
      consoleLogSpy.mockRestore();
    });
  });
});

