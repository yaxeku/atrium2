import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

import jwt from 'jsonwebtoken';
import { PRIVATE_JWT_SECRET } from '$env/dynamic/private';

const SECRET_KEY = PRIVATE_JWT_SECRET;

export async function load({ cookies }: RequestEvent) {
    if (!SECRET_KEY) {
        console.error('JWT_SECRET is not defined. Please set it in your .env file.');
        throw redirect(303, '/login');
    }
    const token = cookies.get('authToken');

    if (!token) {
        throw redirect(303, '/login');
    }

    try {
        const user = jwt.verify(token, SECRET_KEY);
        return { user };
    } catch {
        throw redirect(303, '/login');
    }
}
