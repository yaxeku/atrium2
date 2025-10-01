import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { pool } from '$lib/db/config';
import { PRIVATE_JWT_SECRET } from '$env/dynamic/private';

const JWT_SECRET = PRIVATE_JWT_SECRET;

export async function POST({ request }: RequestEvent) {
    if (!JWT_SECRET) {
        console.error('JWT_SECRET is not defined. Please set it in your .env file.');
        return json({ success: false, error: 'Internal server error: JWT secret not configured' }, { status: 500 });
    }
    try {
        const { username, starting_page } = await request.json();
        const cookies = request.headers.get('cookie');
        
        if (!cookies) {
            return json({ success: false, error: 'No authorization cookie provided' }, { status: 401 });
        }

        const authToken = cookies
            .split('; ')
            .find(row => row.startsWith('authToken='))
            ?.split('=')[1];

        if (!authToken) {
            return json({ success: false, error: 'No authorization token found in cookies' }, { status: 401 });
        }

        const decodedToken = jwt.verify(authToken, JWT_SECRET) as { userName: string };

        if (decodedToken.userName !== username) {
            return json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        if (!username || !starting_page) {
            return json({ success: false, error: 'Username and starting page are required' }, { status: 400 });
        }

        const query = `
            UPDATE USERS 
            SET starting_page = $2
            WHERE username = $1
            RETURNING *
        `;

        const result = await pool.query(query, [username, starting_page]);

        if (result.rows.length === 0) {
            return json({ success: false, error: 'User not found' }, { status: 404 });
        }

        return json({
            success: true,
            message: 'Starting page updated successfully',
            user: result.rows[0]
        });

    } catch (err) {
        console.error('Database error:', err);
        return json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
