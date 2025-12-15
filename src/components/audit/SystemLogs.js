import React, { useEffect, useState } from 'react';
import API from '../../services/apiConfig';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState('');
  const [action, setAction] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 0, totalPages: 1, totalItems: 0 });

  const load = async () => {
    try {
      setLoading(true);
      const toIsoOrUndef = (d, endOfDay = false) => {
        if (!d) return undefined;
        try {
          const iso = endOfDay ? new Date(`${d}T23:59:59Z`).toISOString() : new Date(`${d}T00:00:00Z`).toISOString();
          return iso;
        } catch (_) { return undefined; }
      };
      const params = {
        page,
        size,
        username: user || undefined,
        action: action || undefined,
        from: toIsoOrUndef(startDate, false),
        to: toIsoOrUndef(endDate, true),
      };
      const { data } = await API.get('/audit/logs', { params });
      // Backend returns Spring Page<AuditLog>
      const items = Array.isArray(data?.content) ? data.content : (Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []));
      setLogs(items);
      setPagination({
        currentPage: (typeof data?.number === 'number') ? data.number : (data?.currentPage ?? page),
        totalPages: data?.totalPages ?? 1,
        totalItems: data?.totalElements ?? data?.totalItems ?? items.length,
      });
      setError('');
    } catch (e) {
      console.error('Failed to load logs', e);
      setError('Failed to load logs');
      setLogs([]);
      setPagination({ currentPage: 0, totalPages: 1, totalItems: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(0);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">System Logs</h1>
      </div>

      <form onSubmit={onSearch} className="bg-white shadow rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search message..." className="border rounded px-3 py-2" />
        <input value={user} onChange={(e) => setUser(e.target.value)} placeholder="User" className="border rounded px-3 py-2" />
        <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="Action" className="border rounded px-3 py-2" />
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded px-3 py-2" />
        <div className="flex space-x-2">
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded px-3 py-2 w-full" />
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded whitespace-nowrap">Filter</button>
        </div>
      </form>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log, idx) => (
                  <tr key={log.id || idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.user || log.username || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.action || log.event || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.entity || log.entityType || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-pre-wrap break-words text-sm text-gray-600">{log.message || log.details || '-'}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No logs found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 flex justify-between items-center bg-gray-50 border-t border-gray-200">
            <button
              disabled={pagination.currentPage <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
            >Previous</button>
            <span>Page {pagination.currentPage + 1} of {pagination.totalPages}</span>
            <button
              disabled={pagination.currentPage >= pagination.totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
            >Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemLogs;
