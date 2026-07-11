import { CONFIG } from 'src/config-global';

async function request(method: string, path: string, body?: any) {
  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${CONFIG.apiUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Clear auth on unauthorized and redirect
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // Use router redirect or page refresh to redirect to login
      window.location.href = '/sign-in';
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  get: (path: string) => request('GET', path),
  post: (path: string, body: any) => request('POST', path, body),
  patch: (path: string, body: any) => request('PATCH', path, body),
  put: (path: string, body: any) => request('PUT', path, body),
  delete: (path: string) => request('DELETE', path),
};
