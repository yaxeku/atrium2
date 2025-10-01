import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Connect to the default 'postgres' database to be able to drop another database
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'postgres', // Connect to the default db, not the one we want to drop
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const dbToDrop = process.env.DB_DATABASE;

pool.connect(async (err, client, done) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log(`Successfully connected to the 'postgres' database.`);
    try {
        console.log(`Attempting to drop database: ${dbToDrop}...`);
        // Terminate all connections to the target database before dropping it
        await client.query(`SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '${dbToDrop}' AND pid <> pg_backend_pid();`);
        console.log(`Terminated existing connections to ${dbToDrop}.`);
        await client.query(`DROP DATABASE IF EXISTS ${dbToDrop}`);
        console.log(`Database "${dbToDrop}" has been successfully dropped.`);
    } catch (error) {
        console.error('Error dropping database:', error.stack);
    } finally {
        done();
        pool.end();
    }
});
