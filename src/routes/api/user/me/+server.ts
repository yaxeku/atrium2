import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

export async function GET({ cookies }: RequestEvent) {
    console.log('API /user/me called');
    
    if (!SECRET_KEY) {
        console.error('JWT secret not configured');
        return json({ error: 'JWT secret not configured' }, { status: 500 });
    }
    
    const token = cookies.get('authToken');
    console.log('Token found in /user/me:', token ? 'YES' : 'NO');
    
    if (!token) {
        return json({ error: 'No authentication token' }, { status: 401 });
    }
    
    try {
        const decoded = jwt.verify(token, SECRET_KEY) as { userName: string };
        console.log('Decoded user in /user/me:', decoded.userName);
        return json({ userName: decoded.userName });
    } catch (error) {
        console.error('Token verification failed in /user/me:', error);
        return json({ error: 'Invalid token' }, { status: 401 });
    }
}