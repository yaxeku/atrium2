export async function handle({ event, resolve }) {
    // Get the origin from the request headers
    const origin = event.request.headers.get('origin');
    
    const response = await resolve(event);

    if (origin) {
        // Set CORS headers only for your domain
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    if (event.request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: response.headers,
        });
    }

    return response;
}
