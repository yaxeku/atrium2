import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { pool } from '$lib/db/config';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/dynamic/private';

export async function POST({ request }: RequestEvent) {
    if (!JWT_SECRET) {
        console.error('JWT_SECRET is not defined. Please set it in your .env file.');
        return json({ success: false, error: 'Internal server error: JWT secret not configured' }, { status: 500 });
    }
    try {
        const { guild } = await request.json();

        const cookies = request.headers.get('cookie');
        
        if (!cookies) {
            return json({ error: 'No authorization cookie provided' }, { status: 401 });
        }

        const authToken = cookies
            .split('; ')
            .find(row => row.startsWith('authTokenAdmin='))
            ?.split('=')[1];

        if (!authToken) {
            return json({ error: 'No authorization token found in cookies' }, { status: 401 });
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(authToken, JWT_SECRET);
        } catch (err) {
            return json({ error: 'Invalid or expired authorization token' }, { status: 401 });
        }


        // Validate required field
        if (!guild) {
            return json({ success: false, error: 'Missing guild' }, { status: 400 });
        }

        // Get all users from the specified guild
        const query = `
            SELECT * FROM users 
            WHERE guild = $1`;
        const values = [guild];

        const result = await pool.query(query, values);

        return json({ 
            success: true, 
            users: result.rows
        });

    } catch (error) {
        console.error('Error fetching guild users:', error);
        return json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
