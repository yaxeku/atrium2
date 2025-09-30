import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

import { pool } from '$lib/db/config';

async function createDefaultAdmin() {
    const { DEFAULT_ADMIN, DEFAULT_ADMIN_PASSWORD, DEFAULT_ADMIN_GUILD } = process.env;

    if (!DEFAULT_ADMIN || !DEFAULT_ADMIN_PASSWORD || !DEFAULT_ADMIN_GUILD) {
        console.log('Default admin credentials not found in .env file. Skipping creation.');
        return;
    }

    try {
        const checkQuery = 'SELECT 1 FROM admins WHERE username = $1';
        const checkResult = await pool.query(checkQuery, [DEFAULT_ADMIN]);

        if (checkResult.rowCount === 0) {
            const insertQuery = 'INSERT INTO admins (username, password, guild) VALUES ($1, $2, $3)';
            await pool.query(insertQuery, [DEFAULT_ADMIN, DEFAULT_ADMIN_PASSWORD, DEFAULT_ADMIN_GUILD]);
            console.log('Default admin user created successfully.');
        }
    } catch (error) {
        console.error('Error creating default admin user:', error);
    }
}

createDefaultAdmin();

export async function POST({ request, cookies }: RequestEvent) {
    if (!SECRET_KEY) {
        console.error('JWT_SECRET is not defined. Please set it in your .env file.');
        return json({ success: false, error: 'Internal server error: JWT secret not configured' }, { status: 500 });
    }
    try {
        const { userName, passWord } = await request.json();

        const query = 'SELECT password FROM admins WHERE username = $1';
        const values = [userName];

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return json({ success: false, error: 'Invalid username or password' }, { status: 401 });
        }

        const dbPassword = result.rows[0].password;

        if (passWord !== dbPassword) {
            return json({ success: false, error: 'Invalid username or password' }, { status: 401 });
        }

        const token = jwt.sign({ userName }, SECRET_KEY, { expiresIn: '1h' });

        cookies.set('authTokenAdmin', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 3600, 
            path: '/' 
        });

        // Return success response with the token
        return json({ success: true, token });
    } catch (error) {
        console.error('Error during authentication:', error);
        return json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
