import { redirect } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import type { RequestEvent } from '@sveltejs/kit';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

export function load({ cookies }: RequestEvent) {
    console.log('Dashboard layout: Checking authentication...');
    
    if (!SECRET_KEY) {
        console.error('JWT_SECRET is not defined. Please set it in your .env file.');
        throw redirect(303, '/login');
    }
    
    const token = cookies.get('authToken');
    console.log('Dashboard layout: Token found:', token ? 'YES' : 'NO');
    console.log('Dashboard layout: Token preview:', token ? token.substring(0, 20) + '...' : 'none');
    
    if (!token) {
        console.log('Dashboard layout: No token found, redirecting to login');
        throw redirect(303, '/login'); 
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log('Dashboard layout: Token verified successfully for user:', decoded);
    } catch (error) {
        console.log('Dashboard layout: Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
        throw redirect(303, '/login');
    }

    console.log('Dashboard layout: Authentication successful, allowing access');
    return {};
}
