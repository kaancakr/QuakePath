/**
 * Database Schema Setup
 * Creates tables for storing mesh network location data
 */

const { query } = require('./connection');

/**
 * Initialize database schema
 * Creates the user_locations table if it doesn't exist
 */
const initializeSchema = async () => {
  try {
    // Create user_locations table
    await query(`
      CREATE TABLE IF NOT EXISTS user_locations (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255),
        user_role VARCHAR(50),
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        accuracy DECIMAL(10, 2),
        altitude DECIMAL(10, 2),
        heading DECIMAL(5, 2),
        speed DECIMAL(10, 2),
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better query performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_user_locations_device_id 
      ON user_locations(device_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_user_locations_timestamp 
      ON user_locations(timestamp DESC)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_user_locations_created_at 
      ON user_locations(created_at DESC)
    `);

    // Create composite index for device + timestamp queries
    await query(`
      CREATE INDEX IF NOT EXISTS idx_user_locations_device_timestamp 
      ON user_locations(device_id, timestamp DESC)
    `);

    // Add new columns if table already exists (migration) - MUST BE BEFORE INDEX CREATION
    // Check if columns exist first to avoid errors
    try {
      const checkUserId = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='user_locations' AND column_name='user_id'
      `);
      
      if (checkUserId.rows.length === 0) {
        await query(`
          ALTER TABLE user_locations 
          ADD COLUMN user_id VARCHAR(255)
        `);
        console.log('[DB] Added user_id column');
      } else {
        console.log('[DB] user_id column already exists');
      }
    } catch (error) {
      console.log('[DB] Error checking/adding user_id column:', error.message);
    }

    try {
      const checkUserRole = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='user_locations' AND column_name='user_role'
      `);
      
      if (checkUserRole.rows.length === 0) {
        await query(`
          ALTER TABLE user_locations 
          ADD COLUMN user_role VARCHAR(50)
        `);
        console.log('[DB] Added user_role column');
      } else {
        console.log('[DB] user_role column already exists');
      }
    } catch (error) {
      console.log('[DB] Error checking/adding user_role column:', error.message);
    }

    // Create indexes for new columns (after columns are added)
    try {
      await query(`
        CREATE INDEX IF NOT EXISTS idx_user_locations_user_id 
        ON user_locations(user_id)
      `);
    } catch (error) {
      console.log('[DB] Index creation for user_id:', error.message);
    }

    try {
      await query(`
        CREATE INDEX IF NOT EXISTS idx_user_locations_user_role 
        ON user_locations(user_role)
      `);
    } catch (error) {
      console.log('[DB] Index creation for user_role:', error.message);
    }

    console.log('[DB] Schema initialized successfully');
  } catch (error) {
    console.error('[DB] Error initializing schema:', error);
    throw error;
  }
};

/**
 * Drop all tables (use with caution - for development only)
 */
const dropSchema = async () => {
  try {
    await query('DROP TABLE IF EXISTS user_locations CASCADE');
    console.log('[DB] Schema dropped successfully');
  } catch (error) {
    console.error('[DB] Error dropping schema:', error);
    throw error;
  }
};

module.exports = {
  initializeSchema,
  dropSchema,
};
