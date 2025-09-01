// Vercel Serverless Function format
// This code runs on the server, not in the browser.

export default async function handler(request, response) {
    // 1. Only allow POST requests
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Get the real Gemini API key from environment variables (for security)
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        return response.status(500).json({ error: 'API key is not configured on the server.' });
    }
    
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`;

    try {
        // 3. Forward the request from our frontend to the actual Gemini API
        const geminiResponse = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request.body), // Forward the body from our frontend request
        });

        // 4. Handle potential errors from the Gemini API
        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            console.error('Gemini API Error:', errorText);
            return response.status(geminiResponse.status).json({ error: `Gemini API error: ${errorText}` });
        }

        // 5. Send the successful response from Gemini back to our frontend
        const data = await geminiResponse.json();
        return response.status(200).json(data);

    } catch (error) {
        console.error('Internal Server Error:', error);
        return response.status(500).json({ error: 'An internal error occurred.' });
    }
}
