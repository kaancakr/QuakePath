/**
 * API Types
 * Type definitions for API requests and responses
 */

export interface LocationData {
  deviceId: string;
  userId?: string; // Firebase UID
  userRole?: 'civilian' | 'rescue_team'; // User role
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp?: string;
  metadata?: {
    platform?: string;
    version?: string | number;
    messageId?: string;
    sender?: string;
    source?: string;
    [key: string]: any; // Allow additional metadata fields
  };
}

export interface LocationResponse {
  id: number;
  deviceId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: string;
  createdAt: string;
  metadata: Record<string, any> | null;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
