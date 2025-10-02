import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Connect to the default 'postgres' database to be able to create a new database
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE, // Connect to the default db
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const dbToCreate = process.env.DB_DATABASE;

pool.connect(async (err, client, done) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        pool.end();
        return;
    }
    console.log(`Successfully connected to the 'postgres' database.`);
    try {
        console.log(`Attempting to create database: ${dbToCreate}...`);
        await client.query(`CREATE DATABASE ${dbToCreate}`);
        console.log(`Database "${dbToCreate}" has been successfully created.`);
    } catch (error) {
        if (error.code === '42P04') { // 42P04 is the error code for "database already exists"
            console.log(`Database "${dbToCreate}" already exists.`);
        } else {
            console.error('Error creating database:', error.stack);
        }
    } finally {
        done();
        pool.end();
    }
});
