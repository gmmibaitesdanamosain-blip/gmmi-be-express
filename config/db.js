import pkg from 'pg';
import './env.js';

const { Pool } = pkg;

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.DATABASE_URL;

const connectionConfig = (process.env.DATABASE_URL || process.env.POSTGRES_URL)
  ? {
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false
  }
  : {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD),
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 5432,
  };

const pool = new Pool(connectionConfig);

pool.on('connect', () => {
  console.log('Connected to database');
});

export default pool;