import { API_BASE_URL } from './apiConfig';

export async function fetchAuditLogs({ username, action, from, to, page = 0, size = 20, token }) {
  const params = new URLSearchParams();
  if (username) params.append('username', username);
  if (action) params.append('action', action);
  if (from) params.append('from', new Date(from).toISOString());
  if (to) params.append('to', new Date(to).toISOString());
  params.append('page', page);
  params.append('size', size);

  const res = await fetch(`${API_BASE_URL}/api/audit/logs?${params.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to fetch audit logs');
  }
  return res.json();
}
