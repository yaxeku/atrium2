import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { pool } from '$lib/db/config';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET({ url, request }: RequestEvent) {
    if (!JWT_SECRET) {
        console.error('JWT_SECRET is not defined. Please set it in your .env file.');
        return json({ success: false, error: 'Internal server error: JWT secret not configured' }, { status: 500 });
    }
    const guild = url.searchParams.get('guild');
        
    if (!guild) {
        return json({ 
            success: false, 
            error: 'Guild and username parameters are required' 
        }, { status: 400 });
    }

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

    const decodedToken = jwt.verify(authToken, JWT_SECRET) as { userName: string };


    const adminResult = await pool.query(
        'SELECT guild FROM ADMINS WHERE username = $1',
        [decodedToken.userName]
    );

    if (adminResult.rows.length === 0) {
        return json({ 
            success: false,
            error: 'Unauthorized - User is not an admin'
        }, { status: 403 });
    }

    if (adminResult.rows[0].guild !== guild) {
        return json({ 
            success: false,
            error: 'Unauthorized - User is not an admin of this guild'
        }, { status: 403 });
    }

    try {
        // First get all callers in the guild
        const callersResult = await pool.query(
            'SELECT username FROM USERS WHERE guild = $1',
            [guild]
        );

        const callers = callersResult.rows.map(row => row.username);

        // Then get all targets for these callers from our local database
        const targetsResult = await pool.query(
            'SELECT * FROM targets WHERE belongsto = ANY($1)',
            [callers]
        );

        return json({
            success: true,
            targets: targetsResult.rows
        });

    } catch (err) {
        console.error('Database error:', err);
        return json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
