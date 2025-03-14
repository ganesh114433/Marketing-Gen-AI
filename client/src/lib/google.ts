import { apiRequest } from "./queryClient";

// Get Google OAuth URL
export async function getGoogleAuthUrl(): Promise<string> {
  try {
    const response = await apiRequest('GET', '/api/google/auth-url');
    const data = await response.json();
    return data.url;
  } catch (error: any) {
    throw new Error(`Failed to get Google auth URL: ${error.message}`);
  }
}

// Exchange code for tokens
export async function exchangeCodeForTokens(code: string): Promise<any> {
  try {
    const response = await apiRequest('POST', '/api/google/callback', { code });
    const data = await response.json();
    return data.tokens;
  } catch (error: any) {
    throw new Error(`Failed to exchange code for tokens: ${error.message}`);
  }
}

// Get Analytics data
export async function getAnalyticsData(tokens: string, viewId: string, startDate: string = '7daysAgo', endDate: string = 'today'): Promise<any> {
  try {
    const url = `/api/google/analytics?viewId=${viewId}&startDate=${startDate}&endDate=${endDate}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${tokens}`
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    throw new Error(`Failed to get analytics data: ${error.message}`);
  }
}

// Get Ads data
export async function getAdsData(tokens: string, customerId: string, startDate: string = '7daysAgo', endDate: string = 'today'): Promise<any> {
  try {
    const url = `/api/google/ads?customerId=${customerId}&startDate=${startDate}&endDate=${endDate}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${tokens}`
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    throw new Error(`Failed to get ads data: ${error.message}`);
  }
}

// Get Calendar events
export async function getCalendarEvents(tokens: string, calendarId: string = 'primary', timeMin?: string, timeMax?: string): Promise<any> {
  try {
    let url = `/api/google/calendar?calendarId=${calendarId}`;
    
    if (timeMin) url += `&timeMin=${timeMin}`;
    if (timeMax) url += `&timeMax=${timeMax}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${tokens}`
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    throw new Error(`Failed to get calendar events: ${error.message}`);
  }
}
