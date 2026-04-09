export const config = {
  runtime: 'edge',
};

export default async function handler() {
  const clientId = process.env.VITE_QF_CLIENT_ID || process.env.QF_CLIENT_ID;
  const clientSecret = process.env.QF_CLIENT_SECRET;
  const authUrl = process.env.QF_AUTH_URL || 'https://oauth2.quran.foundation';

  if (!clientId || !clientSecret) {
    return new Response(JSON.stringify({ 
      error: 'Server configuration error', 
      details: `Missing: ${!clientId ? 'ClientID ' : ''}${!clientSecret ? 'ClientSecret' : ''}`
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = btoa(`${clientId}:${clientSecret}`);
    
    const response = await fetch(`${authUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`,
      },
      body: 'grant_type=client_credentials&scope=content',
    });

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch token' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
