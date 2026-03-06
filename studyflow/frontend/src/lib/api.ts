// In the preview environment, we want to use the local backend
const isPreviewEnv = typeof window !== 'undefined' && window.location.hostname.includes('run.app');
export const API_URL = isPreviewEnv ? '' : (import.meta.env.VITE_API_URL || '');

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, options);
  
  // If the response is OK but not JSON (e.g., HTML fallback), throw an error
  const contentType = response.headers.get('content-type');
  if (response.ok && contentType && contentType.includes('text/html')) {
    throw new Error(`Expected JSON but received HTML from ${url}`);
  }
  
  return response;
};
