import { redirect } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import type { RequestEvent } from '@sveltejs/kit';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

export function load({ cookies }: RequestEvent) {
    if (!SECRET_KEY) {
        console.error('JWT_SECRET is not defined. Please set it in your .env file.');
        throw redirect(303, '/login');
    }
    const token = cookies.get('authToken');

    if (!token) {
        throw redirect(303, '/login'); 
    }

    try {
        jwt.verify(token, SECRET_KEY);
    } catch (error) {
        throw redirect(303, '/login');
    }

    return {};
}
