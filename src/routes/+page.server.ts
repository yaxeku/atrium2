import type { RequestEvent } from '@sveltejs/kit';

export async function load({ url, request }: RequestEvent) {
    const idParam = url.searchParams.get('id');
    let targetUser = null;
    
    if (idParam) {
        try {
            // Decode base64 to get username
            targetUser = Buffer.from(idParam, 'base64').toString('utf-8');
            
            // Log the visit (optional)
            console.log('Landing page visit:', {
                targetUser,
                userAgent: request.headers.get('user-agent'),
                ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
                timestamp: new Date().toISOString()
            });
            
            // Here you could also:
            // 1. Save visit to database
            // 2. Track analytics
            // 3. Check if user exists
            
        } catch (error) {
            console.error('Error decoding ID parameter:', error);
            targetUser = null;
        }
    }
    
    return {
        targetUser,
        hasIdParam: !!idParam
    };
}