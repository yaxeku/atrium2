import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

if (!process.env.DB_USER || !process.env.DB_HOST || !process.env.DB_DATABASE || 
    !process.env.DB_PASSWORD || !process.env.DB_PORT) {
    throw new Error('Missing required database environment variables');
}

export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
