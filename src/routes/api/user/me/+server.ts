import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

export async function GET({ cookies }: RequestEvent) {
    if (!SECRET_KEY) {
        return json({ error: 'JWT secret not configured' }, { status: 500 });
    }
    
    const token = cookies.get('authToken');
    
    if (!token) {
        return json({ error: 'No authentication token' }, { status: 401 });
    }
    
    try {
        const decoded = jwt.verify(token, SECRET_KEY) as { userName: string };
        return json({ userName: decoded.userName });
    } catch (error) {
        return json({ error: 'Invalid token' }, { status: 401 });
    }
}