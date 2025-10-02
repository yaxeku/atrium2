import { json } from '@sveltejs/kit';
import { pool } from '$lib/db/config';

export async function GET({ url }) {
    try {
        const username = url.searchParams.get('username');
        console.log('getGuild called with username:', username);

        if (!username) {
            return json({ error: 'Username parameter is required' }, { status: 400 });
        }

        const query = 'SELECT guild FROM USERS WHERE username = $1';
        console.log('Executing query:', query, 'with username:', username);
        
        const result = await pool.query(query, [username]);
        console.log('Query result:', result.rows);

        if (result.rows.length === 0) {
            console.log('User not found:', username);
            return json({ error: 'User not found' }, { status: 404 });
        }

        const guild = result.rows[0].guild;
        console.log('Found guild for user:', username, 'guild:', guild);

        return json({
            guild: guild
        });

    } catch (error) {
        console.error('Database query error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}
