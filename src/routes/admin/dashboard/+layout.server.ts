import { redirect } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import type { RequestEvent } from '@sveltejs/kit';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

export function load({ cookies }: RequestEvent) {
    console.log('Admin dashboard layout: Checking authentication...');
    
    if (!SECRET_KEY) {
        console.error('JWT_SECRET is not defined. Please set it in your .env file.');
        throw redirect(303, '/admin/login');
    }
    
    const token = cookies.get('authTokenAdmin');
    console.log('Admin dashboard layout: Token found:', token ? 'YES' : 'NO');
    console.log('Admin dashboard layout: Token preview:', token ? token.substring(0, 20) + '...' : 'none');
    
    if (!token) {
        console.log('Admin dashboard layout: No token found, redirecting to login');
        throw redirect(303, '/admin/login'); // Redirect to login if no token
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log('Admin dashboard layout: Token verified successfully for user:', decoded);
    } catch (error) {
        console.log('Admin dashboard layout: Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
        throw redirect(303, '/admin/login'); // Redirect if token is invalid
    }

    console.log('Admin dashboard layout: Authentication successful, allowing access');
    // Allow access if token is valid
    return {};
}
