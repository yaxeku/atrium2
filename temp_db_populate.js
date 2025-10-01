import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const { Pool } = pg;

// Connect directly to the target database to populate it
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const sql = fs.readFileSync('database.sql').toString();

pool.connect(async (err, client, done) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        pool.end();
        return;
    }
    console.log(`Successfully connected to the '${process.env.DB_DATABASE}' database.`);
    try {
        console.log('Attempting to populate database with schema from database.sql...');
        await client.query(sql);
        console.log('Database has been successfully populated.');
    } catch (error) {
        console.error('Error populating database:', error.stack);
    } finally {
        done();
        pool.end();
    }
});
