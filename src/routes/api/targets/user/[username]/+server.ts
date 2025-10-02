import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { pool } from '$lib/db/config';

export async function GET({ params }: RequestEvent) {
    const { username } = params;

    try {
        console.log('=== USER TARGETS ENDPOINT CALLED ===');
        console.log('Getting targets for username:', username);
        console.log('Username type:', typeof username);
        console.log('Username length:', username?.length);

        if (!username || username.trim() === '') {
            console.log('ERROR: Empty or invalid username');
            return json({ error: 'Username is required' }, { status: 400 });
        }

        const result = await pool.query(
            'SELECT id, ip, status, currentpage, browser, location, belongsto FROM targets WHERE belongsto = $1',
            [username]
        );

        console.log('Found targets for user:', username, 'count:', result.rows.length);

        const targets = result.rows.map(row => ({
            id: row.id,
            ip: row.ip,
            status: row.status,
            currentpage: row.currentpage,
            browser: row.browser,
            location: row.location,
            belongsto: row.belongsto,
        }));

        return json(targets);
    } catch (err) {
        console.error('Database query error:', err);
        return json({ error: 'Failed to fetch targets' }, { status: 500 });
    }
}