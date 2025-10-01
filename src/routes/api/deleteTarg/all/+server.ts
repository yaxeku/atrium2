import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { pool } from '$lib/db/config';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST({ request }: RequestEvent) {
    if (!JWT_SECRET) {
        console.error('JWT_SECRET is not defined. Please set it in your .env file.');
        return json({ success: false, error: 'Internal server error: JWT secret not configured' }, { status: 500 });
    }
    try {
        const { username } = await request.json();
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

        const query = 'DELETE FROM targets WHERE belongsto = $1';
        await pool.query(query, [username]);

        return json({ success: true });
    } catch (error) {
        console.error('Error deleting targets:', error);
        return json({ success: false, error: 'Failed to delete targets' }, { status: 500 });
    }
}
