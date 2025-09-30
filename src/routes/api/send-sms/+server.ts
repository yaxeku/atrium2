import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export async function POST({ request }: RequestEvent) {
    try {
        const { to, template } = await request.json();

        if (!to || !template) {
            return json({ success: false, error: 'Missing required parameters' }, { status: 400 });
        }

        console.log(`Simulating SMS send to ${to} with template ${template}`);

        return json({ success: true });

    } catch (err) {
        const error = err as { message: string; code?: string; detail?: string };
        console.error('Detailed error:', {
            message: error.message,
            code: error.code,
            detail: error.detail
        });
        return json({ 
            success: false, 
            error: 'Internal server error',
            detail: error.message
        }, { status: 500 });
    }
}
