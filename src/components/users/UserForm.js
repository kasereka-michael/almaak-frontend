import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/apiConfig';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [allRoles, setAllRoles] = useState([]);
  const normalizedUserRoles = useMemo(() => {
    const roles = user?.roles || [];
    return Array.isArray(roles)
      ? roles.map(r => String(r).replace(/^ROLE_/, ''))
      : (user?.role ? [String(user.role).replace(/^ROLE_/, '')] : []);
  }, [user]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [{ data: userData }, { data: rolesData }] = await Promise.all([
          API.get(`/users/${id}`),
          API.get('/roles')
        ]);
        setUser(userData);
        const roleNames = Array.isArray(rolesData) ? rolesData.map(r => String(r.name || r)) : [];
        setAllRoles(Array.from(new Set(roleNames.map(n => n.replace(/^ROLE_/, '')))));
        setError('');
      } catch (e) {
        console.error('Failed to load user or roles', e);
        setError('Failed to load user or roles');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Build payload per backend contract
      const payload = {
        email: user.email || '',
        enabled: user.enabled ?? true,
        accountNonExpired: user.accountNonExpired ?? true,
        accountNonLocked: user.accountNonLocked ?? true,
        credentialsNonExpired: user.credentialsNonExpired ?? true,
        roles: (user.roles && Array.isArray(user.roles) ? user.roles : normalizedUserRoles)
          .map(r => String(r).toUpperCase())
          .map(r => (r.startsWith('ROLE_') ? r : `ROLE_${r}`))
      };
      if (user.password && user.password.trim()) {
        payload.password = user.password.trim();
      }
      await API.put(`/users/${id}`, payload);
      navigate('/users');
    } catch (e2) {
      console.error('Failed to save user', e2);
      const msg = e2?.response?.data?.error || e2?.response?.data?.message || 'Failed to save user';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-red-600">User not found</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Edit User</h1>
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">{error}</div>
      )}
      <form onSubmit={onSubmit} className="bg-white shadow rounded-lg p-6 space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input name="email" type="email" value={user.email || ''} onChange={onChange} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input name="username" value={user.username || ''} onChange={onChange} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password (set to change)</label>
            <input name="password" type="password" value={user.password || ''} onChange={onChange} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Roles</label>
            <select
              multiple
              value={normalizedUserRoles}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                setUser(prev => ({ ...prev, roles: selected }));
              }}
              className="mt-1 block w-full border rounded px-3 py-2 h-32"
            >
              {allRoles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple roles.</p>
          </div>
          <div className="flex items-center space-x-6">
            <label className="inline-flex items-center text-sm text-gray-700">
              <input type="checkbox" name="enabled" checked={!!user.enabled} onChange={onChange} className="mr-2" /> Enabled
            </label>
            <label className="inline-flex items-center text-sm text-gray-700">
              <input type="checkbox" name="accountNonExpired" checked={user.accountNonExpired ?? true} onChange={onChange} className="mr-2" /> Account Non Expired
            </label>
            <label className="inline-flex items-center text-sm text-gray-700">
              <input type="checkbox" name="accountNonLocked" checked={user.accountNonLocked ?? true} onChange={onChange} className="mr-2" /> Account Non Locked
            </label>
            <label className="inline-flex items-center text-sm text-gray-700">
              <input type="checkbox" name="credentialsNonExpired" checked={user.credentialsNonExpired ?? true} onChange={onChange} className="mr-2" /> Credentials Non Expired
            </label>
          </div>
        </div>
        <div className="flex space-x-3">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => navigate('/users')} className="px-4 py-2 bg-gray-200 text-gray-700 rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
