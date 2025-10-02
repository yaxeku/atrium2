import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { pool } from '$lib/db/config';

export async function POST({ request }: RequestEvent) {
    try {
        const { domain, username } = await request.json();

        if (!domain) {
            return json({ template: 'Coinbase', starterPage: 'account_review' });
        }

        // Get domain template from database
        const result = await pool.query(
            'SELECT template FROM guilddomains WHERE url = $1',
            [domain]
        );

        let template = 'Coinbase'; // Default template
        if (result.rows.length > 0) {
            template = result.rows[0].template || 'Coinbase';
        }

        // Get starter page for user
        let starterPage = 'account_review';
        if (username) {
            const userResult = await pool.query(
                'SELECT starting_page FROM users WHERE username = $1',
                [username]
            );
            
            if (userResult.rows.length > 0) {
                starterPage = userResult.rows[0].starting_page || 'account_review';
            }
        }

        return json({
            template: template,
            starterPage: starterPage
        });

    } catch (err) {
        console.error('Error getting domain template:', err);
        return json({ template: 'Coinbase', starterPage: 'account_review' });
    }
}