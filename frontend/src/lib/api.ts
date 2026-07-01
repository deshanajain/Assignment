const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function request(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { headers, ...options });
  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await res.json().catch(() => ({}))
    : await res.text().catch(() => '');

  if (!res.ok) {
    throw new Error(typeof body === 'string' ? body : body.message || res.statusText);
  }

  return typeof body === 'string' ? {} : body;
}

export function setToken(token: string|null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}
