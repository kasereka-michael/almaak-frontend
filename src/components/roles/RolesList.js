import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/apiConfig';

const RolesList = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/roles');
      const items = Array.isArray(data) ? data : (Array.isArray(data?.roles) ? data.roles : []);
      setRoles(items);
      setError('');
    } catch (e) {
      console.error('Failed to load roles', e);
      setError('Failed to load roles');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = roles.filter(r => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const name = (r.name || '').toLowerCase();
    return name.includes(q);
  });

  const onDelete = async (id, name) => {
    if (!window.confirm(`Delete role "${name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/roles/${id}`);
      setRoles(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error('Delete role failed', e);
      setError('Failed to delete role');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Roles</h1>
        <div className="flex items-center space-x-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles..."
            className="border rounded px-3 py-2"
          />
          <Link
            to="/roles/add"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            New Role
          </Link>
        </div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{r.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/roles/edit/${r.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                      <button onClick={() => onDelete(r.id, r.name)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="2" className="px-6 py-4 text-center text-gray-500">No roles found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesList;
