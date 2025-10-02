// src/routes/api/targets/[targetid]/+server.js
import { json } from '@sveltejs/kit';
import { pool } from '$lib/db/config';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
    const { targetid } = params;

    try {
        console.log('=== TARGETID ENDPOINT CALLED ===');
        console.log('Received targetid:', targetid);
        console.log('Targetid type:', typeof targetid);
        console.log('Targetid length:', targetid?.length);
        
        // Validate that targetid is a proper UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(targetid)) {
            console.log('ERROR: Invalid UUID format for targetid:', targetid);
            return json({ error: 'Invalid UUID format for targetid' }, { status: 400 });
        }

        console.log('Valid UUID, proceeding with query...');

        const result = await pool.query(
            'SELECT targetid, page, captureddata FROM captureddata WHERE targetid = $1',
            [targetid]
        );

        const capturedLogs = result.rows.map(row => ({
            targetid: row.targetid,
            page: row.page,
            captureddata: row.captureddata,
        }));

        return json(capturedLogs);
    } catch (err) {
        console.error('Database query error:', err);
        return json({ error: 'Failed to fetch captured data' }, { status: 500 });
    }
}
