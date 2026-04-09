/**
 * Quran Foundation Content API Service
 * Handles authenticated requests via OAuth2 Client Credentials flow.
 * Uses a serverless proxy (/api/token) to securely manage the Client Secret.
 */

const API_BASE = import.meta.env.VITE_QF_API_URL;
const CLIENT_ID = import.meta.env.VITE_QF_CLIENT_ID;

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface CachedToken {
  token: string;
  expiry: number;
}

export class QFContentService {
  private static STORAGE_KEY = 'qf_auth_token';

  /**
   * Retrieves a valid access token from localStorage or fetches a new one via proxy.
   */
  private static async getValidToken(): Promise<string> {
    const cached = localStorage.getItem(this.STORAGE_KEY);
    
    if (cached) {
      try {
        const { token, expiry }: CachedToken = JSON.parse(cached);
        // Re-request if token is expired or expiring within 60 seconds
        if (Date.now() < expiry - 60000) {
          return token;
        }
      } catch (e) {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }

    const response = await fetch('/api/token', { method: 'POST' });
    if (!response.ok) {
      throw new Error('Authentication failed: Unable to fetch access token');
    }

    const data: TokenResponse = await response.json();
    const expiry = Date.now() + (data.expires_in * 1000);

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      token: data.access_token,
      expiry
    }));

    return data.access_token;
  }

  /**
   * Wrapper for fetch that automatically handles authentication and 401 retries.
   */
  private static async fetchWithAuth(path: string, options: RequestInit = {}, isRetry = false): Promise<Response> {
    try {
      const token = await this.getValidToken();
      
      const url = `${API_BASE}${path}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'x-auth-token': token,
          'x-client-id': CLIENT_ID || '',
          'Accept': 'application/json'
        }
      });

      // Handle 401 Unauthorized: Clear cache and retry once
      if (response.status === 401 && !isRetry) {
        localStorage.removeItem(this.STORAGE_KEY);
        return this.fetchWithAuth(path, options, true);
      }

      return response;
    } catch (error) {
      console.error('QF API Fetch Error:', error);
      throw error;
    }
  }

  /**
   * Fetch all chapters (Verification API)
   */
  static async getChapters() {
    const response = await this.fetchWithAuth('/content/api/v4/chapters');
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `API Request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.chapters;
  }
}
