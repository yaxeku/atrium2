import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;
const saltRounds = 10;

import { pool } from '$lib/db/config';

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

        console.log("Password received from user:", passWord);
        console.log("Hashed password from database:", dbPassword);

        const passwordMatch = await bcrypt.compare(passWord, dbPassword);
        console.log("Password match result:", passwordMatch);

        if (!passwordMatch) {
            return json({ success: false, error: 'Invalid username or password' }, { status: 401 });
        }

        const token = jwt.sign({ userName }, SECRET_KEY, { expiresIn: '1h' });

        console.log('Admin login successful for user:', userName);
        console.log('Generated admin token:', token.substring(0, 20) + '...');
        
        // Check if we're in production by looking for build environment or process
        const isProduction = process.env.NODE_ENV === 'production' || process.env.DOMAIN_NAME;
        console.log('Is production environment:', isProduction);
        console.log('DOMAIN_NAME:', process.env.DOMAIN_NAME);
        
        // Simplified cookie settings for IP address
        cookies.set('authTokenAdmin', token, {
            httpOnly: true,   // Back to true for security
            secure: false,    // Always false for IP addresses
            sameSite: 'lax',
            maxAge: 3600,
            path: '/'
        });
        
        console.log('Admin cookie set successfully');

        // Return success response with the token
        return json({ success: true, token });
    } catch (error) {
        console.error('Error during authentication:', error);
        return json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
