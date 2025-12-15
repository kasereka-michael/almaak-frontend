import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/apiConfig';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [pagination, setPagination] = useState({ currentPage: 0, totalPages: 1, totalItems: 0 });
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/users');
      const items = Array.isArray(data) ? data : (Array.isArray(data?.users) ? data.users : []);
      setUsers(items);
      setPagination({
        currentPage: 0,
        totalPages: 1,
        totalItems: items.length,
      });
      setError('');
    } catch (e) {
      console.error('Failed to load users', e);
      setError('Failed to load users');
      setUsers([]);
      setPagination({ currentPage: 0, totalPages: 1, totalItems: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, size]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Users</h1>
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="border rounded px-3 py-2"
          />
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Search</button>
        </form>
      </div>

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id || u.userId}>
                    <td className="px-6 py-4 whitespace-nowrap">{u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{u.email || u.username || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.role || (u.roles ? u.roles.join(', ') : 'N/A')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/users/edit/${u.id || u.userId}`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No users found</td>
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

export default UsersList;
