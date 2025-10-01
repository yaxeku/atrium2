import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { pool } from '$lib/db/config';
import jwt from 'jsonwebtoken';
import { PRIVATE_JWT_SECRET } from '$env/dynamic/private';

const JWT_SECRET = PRIVATE_JWT_SECRET;

export async function POST({ request }: RequestEvent) {
    if (!JWT_SECRET) {
        console.error('JWT_SECRET is not defined. Please set it in your .env file.');
        return json({ success: false, error: 'Internal server error: JWT secret not configured' }, { status: 500 });
    }
    try {
        const { username, guild } = await request.json();
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

        if (!username || !guild) {
            return json({ success: false, error: 'Missing required parameters' }, { status: 400 });
        }

        const query = `
            DELETE FROM USERS 
            WHERE username = $1 AND guild = $2
            RETURNING *
        `;

        const result = await pool.query(query, [username, guild]);

        if (result.rowCount === 0) {
            return json({ success: false, error: 'User not found' }, { status: 404 });
        }

        return json({ success: true });

    } catch (err) {
        console.error('Database error:', err);
        return json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
