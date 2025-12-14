import API from './apiConfig';

export async function fetchAuditLogs({ username, action, from, to, page = 0, size = 20 }) {
  const params = {
    ...(username ? { username } : {}),
    ...(action ? { action } : {}),
    ...(from ? { from: new Date(from).toISOString() } : {}),
    ...(to ? { to: new Date(to).toISOString() } : {}),
    page,
    size,
  };
  const { data } = await API.get('/audit/logs', { params });
  return data;
}
