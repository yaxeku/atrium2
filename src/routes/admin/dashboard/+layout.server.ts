import { redirect } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import type { RequestEvent } from '@sveltejs/kit';
import { JWT_SECRET } from '$env/dynamic/private';

const SECRET_KEY = JWT_SECRET;

export function load({ cookies }: RequestEvent) {
    if (!SECRET_KEY) {
        console.error('JWT_SECRET is not defined. Please set it in your .env file.');
        throw redirect(303, '/admin/login');
    }
    const token = cookies.get('authTokenAdmin');

    if (!token) {
        throw redirect(303, '/admin/login'); // Redirect to login if no token
    }

    try {
        // Verify the token
        jwt.verify(token, SECRET_KEY);
    } catch (error) {
        throw redirect(303, '/admin/login'); // Redirect if token is invalid
    }

    // Allow access if token is valid
    return {};
}
