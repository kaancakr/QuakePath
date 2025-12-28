import {
  createEmergencyAlert,
  subscribeEmergencies,
  sendEmergencyMessage,
  subscribeEmergencyMessages,
  EmergencyStatus,
  EmergencyRecord,
  EmergencyMessage,
} from '../firebaseEmergency';
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/FirebaseConfig';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(),
  collection: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => ({ toDate: () => new Date() })),
  Timestamp: {
    now: jest.fn(),
    fromDate: jest.fn(),
  },
}));

jest.mock('@/FirebaseConfig', () => ({
  db: {},
}));

describe('firebaseEmergency', () => {
  const mockAddDoc = addDoc as jest.Mock;
  const mockCollection = collection as jest.Mock;
  const mockOnSnapshot = onSnapshot as jest.Mock;
  const mockQuery = query as jest.Mock;
  const mockOrderBy = orderBy as jest.Mock;
  const mockServerTimestamp = serverTimestamp as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockServerTimestamp.mockReturnValue({ toDate: () => new Date() });
  });

  describe('createEmergencyAlert', () => {
    it('should create emergency alert with required fields', async () => {
      const mockDocRef = { id: 'emergency-123' };
      const mockMessagesRef = {};
      
      mockAddDoc
        .mockResolvedValueOnce(mockDocRef) // First call for emergency
        .mockResolvedValueOnce({ id: 'message-123' }); // Second call for message
      
      mockCollection
        .mockReturnValueOnce({}) // emergenciesRef
        .mockReturnValueOnce(mockMessagesRef); // messagesRef
      
      const input = {
        userId: 'user-123',
        lat: 39.92077,
        lng: 32.85411,
        message: 'Emergency test',
      };
      
      const result = await createEmergencyAlert(input);
      
      expect(mockAddDoc).toHaveBeenCalledTimes(2);
      expect(result.id).toBe('emergency-123');
      expect(result.userId).toBe('user-123');
      expect(result.lat).toBe(39.92077);
      expect(result.lng).toBe(32.85411);
      expect(result.message).toBe('Emergency test');
      expect(result.status).toBe('active');
    });

    it('should use provided status when specified', async () => {
      const mockDocRef = { id: 'emergency-123' };
      mockAddDoc
        .mockResolvedValueOnce(mockDocRef)
        .mockResolvedValueOnce({ id: 'message-123' });
      
      mockCollection.mockReturnValue({});
      
      const input = {
        userId: 'user-123',
        lat: 39.92077,
        lng: 32.85411,
        message: 'Emergency test',
        status: 'resolved' as EmergencyStatus,
      };
      
      const result = await createEmergencyAlert(input);
      
      expect(result.status).toBe('resolved');
    });

    it('should use initialMessageText when provided', async () => {
      const mockDocRef = { id: 'emergency-123' };
      mockAddDoc
        .mockResolvedValueOnce(mockDocRef)
        .mockResolvedValueOnce({ id: 'message-123' });
      
      mockCollection.mockReturnValue({});
      
      const input = {
        userId: 'user-123',
        lat: 39.92077,
        lng: 32.85411,
        message: 'Emergency test',
        initialMessageText: 'Initial message text',
      };
      
      await createEmergencyAlert(input);
      
      const messageCall = mockAddDoc.mock.calls[1];
      expect(messageCall[1].text).toBe('Initial message text');
    });

    it('should use message as initialMessageText when not provided', async () => {
      const mockDocRef = { id: 'emergency-123' };
      mockAddDoc
        .mockResolvedValueOnce(mockDocRef)
        .mockResolvedValueOnce({ id: 'message-123' });
      
      mockCollection.mockReturnValue({});
      
      const input = {
        userId: 'user-123',
        lat: 39.92077,
        lng: 32.85411,
        message: 'Emergency test message',
      };
      
      await createEmergencyAlert(input);
      
      const messageCall = mockAddDoc.mock.calls[1];
      expect(messageCall[1].text).toBe('Emergency test message');
    });

    it('should include createdAt timestamp', async () => {
      const mockDocRef = { id: 'emergency-123' };
      mockAddDoc
        .mockResolvedValueOnce(mockDocRef)
        .mockResolvedValueOnce({ id: 'message-123' });
      
      mockCollection.mockReturnValue({});
      
      const input = {
        userId: 'user-123',
        lat: 39.92077,
        lng: 32.85411,
        message: 'Emergency test',
      };
      
      const result = await createEmergencyAlert(input);
      
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should handle negative coordinates', async () => {
      const mockDocRef = { id: 'emergency-123' };
      mockAddDoc
        .mockResolvedValueOnce(mockDocRef)
        .mockResolvedValueOnce({ id: 'message-123' });
      
      mockCollection.mockReturnValue({});
      
      const input = {
        userId: 'user-123',
        lat: -37.8136,
        lng: 144.9631,
        message: 'Emergency in Melbourne',
      };
      
      const result = await createEmergencyAlert(input);
      
      expect(result.lat).toBe(-37.8136);
      expect(result.lng).toBe(144.9631);
    });
  });

  describe('subscribeEmergencies', () => {
    it('should set up snapshot listener with correct query', () => {
      const mockEmergenciesRef = {};
      const mockQueryResult = {};
      const mockCallback = jest.fn();
      
      mockCollection.mockReturnValue(mockEmergenciesRef);
      mockOrderBy.mockReturnValue({});
      mockQuery.mockReturnValue(mockQueryResult);
      
      const unsubscribe = subscribeEmergencies(mockCallback);
      
      expect(mockCollection).toHaveBeenCalledWith(db, 'emergencies');
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(mockQuery).toHaveBeenCalled();
      expect(mockOnSnapshot).toHaveBeenCalledWith(mockQueryResult, expect.any(Function));
    });

    it('should call onChange with transformed emergency records', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      
      mockCollection.mockReturnValue({});
      mockOrderBy.mockReturnValue({});
      mockQuery.mockReturnValue({});
      mockOnSnapshot.mockImplementation((q, callback) => {
        const mockSnapshot = {
          docs: [
            {
              id: 'emergency-1',
              data: () => ({
                userId: 'user-1',
                lat: 39.92077,
                lng: 32.85411,
                message: 'Emergency 1',
                status: 'active',
                createdAt: { toDate: () => new Date('2024-01-01') },
              }),
            },
            {
              id: 'emergency-2',
              data: () => ({
                userId: 'user-2',
                lat: 40.7128,
                lng: -74.0060,
                message: 'Emergency 2',
                status: 'resolved',
                createdAt: { toDate: () => new Date('2024-01-02') },
              }),
            },
          ],
        };
        callback(mockSnapshot);
        return mockUnsubscribe;
      });
      
      subscribeEmergencies(mockCallback);
      
      expect(mockCallback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'emergency-1',
            userId: 'user-1',
            lat: 39.92077,
            lng: 32.85411,
            message: 'Emergency 1',
            status: 'active',
          }),
          expect.objectContaining({
            id: 'emergency-2',
            userId: 'user-2',
            lat: 40.7128,
            lng: -74.0060,
            message: 'Emergency 2',
            status: 'resolved',
          }),
        ])
      );
    });

    it('should handle missing fields with defaults', () => {
      const mockCallback = jest.fn();
      
      mockCollection.mockReturnValue({});
      mockOrderBy.mockReturnValue({});
      mockQuery.mockReturnValue({});
      mockOnSnapshot.mockImplementation((q, callback) => {
        const mockSnapshot = {
          docs: [
            {
              id: 'emergency-incomplete',
              data: () => ({
                // Missing some fields
                lat: 39.92077,
              }),
            },
          ],
        };
        callback(mockSnapshot);
        return jest.fn();
      });
      
      subscribeEmergencies(mockCallback);
      
      expect(mockCallback).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 'emergency-incomplete',
          userId: 'unknown',
          lat: 39.92077,
          lng: 0,
          message: '',
          status: 'active',
        }),
      ]);
    });

    it('should return unsubscribe function', () => {
      const mockUnsubscribe = jest.fn();
      mockCollection.mockReturnValue({});
      mockOrderBy.mockReturnValue({});
      mockQuery.mockReturnValue({});
      mockOnSnapshot.mockReturnValue(mockUnsubscribe);
      
      const unsubscribe = subscribeEmergencies(jest.fn());
      
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('sendEmergencyMessage', () => {
    it('should send message to emergency messages collection', async () => {
      const mockMessagesRef = {};
      mockCollection.mockReturnValue(mockMessagesRef);
      mockAddDoc.mockResolvedValue({ id: 'message-123' });
      
      const input = {
        emergencyId: 'emergency-123',
        senderId: 'user-456',
        text: 'Help is on the way!',
      };
      
      await sendEmergencyMessage(input);
      
      // Firebase collection is called with emergenciesRef (already a collection), emergencyId, and 'messages'
      expect(mockCollection).toHaveBeenCalled();
      expect(mockAddDoc).toHaveBeenCalledWith(mockMessagesRef, {
        senderId: 'user-456',
        text: 'Help is on the way!',
        createdAt: expect.anything(),
      });
    });

    it('should include serverTimestamp for createdAt', async () => {
      mockCollection.mockReturnValue({});
      mockAddDoc.mockResolvedValue({ id: 'message-123' });
      
      await sendEmergencyMessage({
        emergencyId: 'emergency-123',
        senderId: 'user-456',
        text: 'Test message',
      });
      
      const callArgs = mockAddDoc.mock.calls[0][1];
      expect(callArgs.createdAt).toBeDefined();
    });

    it('should handle empty message text', async () => {
      mockCollection.mockReturnValue({});
      mockAddDoc.mockResolvedValue({ id: 'message-123' });
      
      await sendEmergencyMessage({
        emergencyId: 'emergency-123',
        senderId: 'user-456',
        text: '',
      });
      
      const callArgs = mockAddDoc.mock.calls[0][1];
      expect(callArgs.text).toBe('');
    });
  });

  describe('subscribeEmergencyMessages', () => {
    it('should set up snapshot listener for messages', () => {
      const mockMessagesRef = {};
      const mockQueryResult = {};
      const mockCallback = jest.fn();
      
      mockCollection.mockReturnValue(mockMessagesRef);
      mockOrderBy.mockReturnValue({});
      mockQuery.mockReturnValue(mockQueryResult);
      
      const unsubscribe = subscribeEmergencyMessages('emergency-123', mockCallback);
      
      // Firebase collection is called with emergenciesRef (already a collection), emergencyId, and 'messages'
      expect(mockCollection).toHaveBeenCalled();
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'asc');
      expect(mockQuery).toHaveBeenCalled();
      expect(mockOnSnapshot).toHaveBeenCalledWith(mockQueryResult, expect.any(Function));
    });

    it('should call onChange with transformed messages', () => {
      const mockCallback = jest.fn();
      
      mockCollection.mockReturnValue({});
      mockOrderBy.mockReturnValue({});
      mockQuery.mockReturnValue({});
      mockOnSnapshot.mockImplementation((q, callback) => {
        const mockSnapshot = {
          docs: [
            {
              id: 'message-1',
              data: () => ({
                senderId: 'user-1',
                text: 'First message',
                createdAt: { toDate: () => new Date('2024-01-01') },
              }),
            },
            {
              id: 'message-2',
              data: () => ({
                senderId: 'user-2',
                text: 'Second message',
                createdAt: { toDate: () => new Date('2024-01-02') },
              }),
            },
          ],
        };
        callback(mockSnapshot);
        return jest.fn();
      });
      
      subscribeEmergencyMessages('emergency-123', mockCallback);
      
      expect(mockCallback).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 'message-1',
          emergencyId: 'emergency-123',
          senderId: 'user-1',
          text: 'First message',
        }),
        expect.objectContaining({
          id: 'message-2',
          emergencyId: 'emergency-123',
          senderId: 'user-2',
          text: 'Second message',
        }),
      ]);
    });

    it('should handle missing message fields with defaults', () => {
      const mockCallback = jest.fn();
      
      mockCollection.mockReturnValue({});
      mockOrderBy.mockReturnValue({});
      mockQuery.mockReturnValue({});
      mockOnSnapshot.mockImplementation((q, callback) => {
        const mockSnapshot = {
          docs: [
            {
              id: 'message-incomplete',
              data: () => ({
                // Missing some fields
                text: 'Incomplete message',
              }),
            },
          ],
        };
        callback(mockSnapshot);
        return jest.fn();
      });
      
      subscribeEmergencyMessages('emergency-123', mockCallback);
      
      expect(mockCallback).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 'message-incomplete',
          emergencyId: 'emergency-123',
          senderId: 'unknown',
          text: 'Incomplete message',
        }),
      ]);
    });

    it('should order messages by createdAt ascending', () => {
      mockCollection.mockReturnValue({});
      mockOrderBy.mockReturnValue({});
      mockQuery.mockReturnValue({});
      
      subscribeEmergencyMessages('emergency-123', jest.fn());
      
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'asc');
    });

    it('should return unsubscribe function', () => {
      const mockUnsubscribe = jest.fn();
      mockCollection.mockReturnValue({});
      mockOrderBy.mockReturnValue({});
      mockQuery.mockReturnValue({});
      mockOnSnapshot.mockReturnValue(mockUnsubscribe);
      
      const unsubscribe = subscribeEmergencyMessages('emergency-123', jest.fn());
      
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null Timestamp values', () => {
      const mockCallback = jest.fn();
      
      mockCollection.mockReturnValue({});
      mockOrderBy.mockReturnValue({});
      mockQuery.mockReturnValue({});
      mockOnSnapshot.mockImplementation((q, callback) => {
        const mockSnapshot = {
          docs: [
            {
              id: 'emergency-null-timestamp',
              data: () => ({
                userId: 'user-1',
                lat: 39.92077,
                lng: 32.85411,
                message: 'Test',
                status: 'active',
                createdAt: null,
              }),
            },
          ],
        };
        callback(mockSnapshot);
        return jest.fn();
      });
      
      subscribeEmergencies(mockCallback);
      
      expect(mockCallback).toHaveBeenCalled();
      const result = mockCallback.mock.calls[0][0][0];
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should handle Timestamp without toDate method', () => {
      const mockCallback = jest.fn();
      
      mockCollection.mockReturnValue({});
      mockOrderBy.mockReturnValue({});
      mockQuery.mockReturnValue({});
      mockOnSnapshot.mockImplementation((q, callback) => {
        const mockSnapshot = {
          docs: [
            {
              id: 'emergency-no-todate',
              data: () => ({
                userId: 'user-1',
                lat: 39.92077,
                lng: 32.85411,
                message: 'Test',
                status: 'active',
                createdAt: {}, // No toDate method
              }),
            },
          ],
        };
        callback(mockSnapshot);
        return jest.fn();
      });
      
      subscribeEmergencies(mockCallback);
      
      expect(mockCallback).toHaveBeenCalled();
      const result = mockCallback.mock.calls[0][0][0];
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });
});

