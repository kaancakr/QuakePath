/**
 * Location Repository
 * Database operations for user locations
 */

const { query } = require('./connection');

/**
 * Insert a new location record
 * @param {Object} locationData - Location data from mesh network
 * @returns {Promise<Object>} Created location record
 */
const createLocation = async (locationData) => {
  const {
    deviceId,
    userId = null,
    userRole = null,
    latitude,
    longitude,
    accuracy = null,
    altitude = null,
    heading = null,
    speed = null,
    timestamp,
    metadata = null,
  } = locationData;

  const result = await query(
    `INSERT INTO user_locations 
     (device_id, user_id, user_role, latitude, longitude, accuracy, altitude, heading, speed, timestamp, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      deviceId,
      userId,
      userRole,
      latitude,
      longitude,
      accuracy,
      altitude,
      heading,
      speed,
      timestamp || new Date().toISOString(),
      metadata ? JSON.stringify(metadata) : null,
    ]
  );

  return result.rows[0];
};

/**
 * Get locations for a specific device
 * @param {string} deviceId - Device identifier
 * @param {number} limit - Maximum number of records to return
 * @returns {Promise<Array>} Array of location records
 */
const getLocationsByDevice = async (deviceId, limit = 50) => {
  const result = await query(
    `SELECT * FROM user_locations
     WHERE device_id = $1
     ORDER BY timestamp DESC, created_at DESC
     LIMIT $2`,
    [deviceId, limit]
  );

  return result.rows;
};

/**
 * Get recent locations from all devices
 * @param {number} limit - Maximum number of records to return
 * @returns {Promise<Array>} Array of location records
 */
const getRecentLocations = async (limit = 100) => {
  const result = await query(
    `SELECT * FROM user_locations
     ORDER BY timestamp DESC, created_at DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows;
};

/**
 * Get recent locations from civilians only (for rescue teams)
 * @param {number} limit - Maximum number of records to return
 * @returns {Promise<Array>} Array of location records
 */
const getCivilianLocations = async (limit = 1000) => {
  const result = await query(
    `SELECT * FROM user_locations
     WHERE user_role = 'civilian' OR user_role IS NULL
     ORDER BY timestamp DESC, created_at DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows;
};

/**
 * Get locations grouped by user (latest location per user)
 * @param {number} limit - Maximum number of users to return
 * @returns {Promise<Array>} Array of location records (one per user)
 */
const getLatestLocationsByUser = async (limit = 100) => {
  const result = await query(
    `SELECT DISTINCT ON (user_id, device_id) *
     FROM user_locations
     WHERE (user_role = 'civilian' OR user_role IS NULL)
       AND user_id IS NOT NULL
     ORDER BY user_id, device_id, timestamp DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows;
};

/**
 * Get locations within a time range
 * @param {Date} startTime - Start time
 * @param {Date} endTime - End time
 * @param {number} limit - Maximum number of records to return
 * @returns {Promise<Array>} Array of location records
 */
const getLocationsByTimeRange = async (startTime, endTime, limit = 100) => {
  const result = await query(
    `SELECT * FROM user_locations
     WHERE timestamp >= $1 AND timestamp <= $2
     ORDER BY timestamp DESC
     LIMIT $3`,
    [startTime, endTime, limit]
  );

  return result.rows;
};

/**
 * Get locations within a geographic bounding box
 * @param {number} minLat - Minimum latitude
 * @param {number} maxLat - Maximum latitude
 * @param {number} minLng - Minimum longitude
 * @param {number} maxLng - Maximum longitude
 * @param {number} limit - Maximum number of records to return
 * @returns {Promise<Array>} Array of location records
 */
const getLocationsByBounds = async (minLat, maxLat, minLng, maxLng, limit = 100) => {
  const result = await query(
    `SELECT * FROM user_locations
     WHERE latitude >= $1 AND latitude <= $2
       AND longitude >= $3 AND longitude <= $4
     ORDER BY timestamp DESC
     LIMIT $5`,
    [minLat, maxLat, minLng, maxLng, limit]
  );

  return result.rows;
};

/**
 * Get count of locations for a device
 * @param {string} deviceId - Device identifier
 * @returns {Promise<number>} Count of locations
 */
const getLocationCountByDevice = async (deviceId) => {
  const result = await query(
    `SELECT COUNT(*) as count FROM user_locations WHERE device_id = $1`,
    [deviceId]
  );

  return parseInt(result.rows[0].count, 10);
};

module.exports = {
  createLocation,
  getLocationsByDevice,
  getRecentLocations,
  getLocationsByTimeRange,
  getLocationsByBounds,
  getLocationCountByDevice,
  getCivilianLocations,
  getLatestLocationsByUser,
};
