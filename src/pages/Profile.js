import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserService from '../services/userService';
import API from '../services/apiConfig';
import { fetchAuditLogs } from '../services/auditApi';

const Field = ({ label, children }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
  </div>
);

export default function Profile() {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState(null);

  // Activity Log state (must be before any returns)
  const [logs, setLogs] = useState({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 });
  const [logFilters, setLogFilters] = useState({ action: '', from: '', to: '' });
  const [logLoading, setLogLoading] = useState(false);

  const loadLogs = async (page = 0) => {
    try {
      setLogLoading(true);
      const token = localStorage.getItem('token');
      const data = await fetchAuditLogs({ username: profile?.username, action: logFilters.action || undefined, from: logFilters.from || undefined, to: logFilters.to || undefined, page, size: logs.size, token });
      setLogs(data);
    } catch (e) {
      // ignore UI errors here to avoid blocking profile
    } finally {
      setLogLoading(false);
    }
  };

  const isAdmin = useMemo(() => {
    const roles = (profile?.roles || authUser?.roles || []);
    if (!Array.isArray(roles)) return false;
    return roles.map(String).some(r => r === 'ADMIN' || r === 'ROLE_ADMIN');
  }, [profile, authUser]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await UserService.getCurrentUserProfile();
        if (mounted) setProfile(me);
        // Load available roles for admin UI
        try {
          const { data } = await API.get('roles');
          const roleNames = (Array.isArray(data) ? data : []).map(r => String(r.name || r).replace(/^ROLE_/, ''));
          const unique = Array.from(new Set(roleNames));
          if (mounted) setAvailableRoles(unique);
        } catch (_) {}
      } catch (e) {
        setError('Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const updated = await UserService.updateCurrentUserProfile(profile);
      setProfile(updated);
      setMessage('Profile updated');
    } catch (e) {
      setError(e.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  // Admin quick actions (create user and role)
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', roles: ['USER'] });
  const [newRole, setNewRole] = useState('');
  const [availableRoles, setAvailableRoles] = useState([]);

  const createUser = async () => {
    setError('');
    setMessage('');
    try {
      const created = await UserService.createUser(newUser);
      setMessage(`User ${created.username} created`);
      setNewUser({ username: '', email: '', password: '', roles: ['USER'] });
    } catch (e) {
      setError(e.message || 'Failed to create user');
    }
  };

  // Role service is not in repo yet; we will use role endpoints via fetch directly here
  const createRole = async () => {
    setError('');
    setMessage('');
    try {
      const { data } = await API.post('roles', { name: newRole });
      setMessage(`Role ${data?.name || newRole} created`);
      setNewRole('');
    } catch (e) {
      setError(e.message || 'Failed to create role');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>No profile</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">My Profile</h1>
          <p className="text-sm text-gray-500">Update your personal information and account details.</p>
          {/* Roles display */}
          <div className="mt-2">
            <span className="text-sm font-medium text-gray-700 mr-2">Your Roles:</span>
            {(profile?.roles || authUser?.roles || []).map((role, idx) => {
              const r = String(role).replace(/^ROLE_/, '');
              const colorMap = {
                ADMIN: 'bg-red-100 text-red-800',
                MANAGER: 'bg-blue-100 text-blue-800',
                HR: 'bg-green-100 text-green-800',
                FINANCE: 'bg-yellow-100 text-yellow-800',
                SALES: 'bg-pink-100 text-pink-800',
                TECHNICIAN: 'bg-indigo-100 text-indigo-800',
                PROJECT_MANAGER: 'bg-cyan-100 text-cyan-800',
                USER: 'bg-gray-100 text-gray-800'
              };
              const classes = colorMap[r] || 'bg-gray-100 text-gray-800';
              return (
                <span key={idx} className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium mr-2 mb-2 ${classes}`}>
                  {r}
                </span>
              );
            })}
          </div>
        </div>
        <button
          onClick={saveProfile}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && <div className="p-3 bg-red-100 text-red-800 rounded border border-red-200">{error}</div>}
      {message && <div className="p-3 bg-green-100 text-green-800 rounded border border-green-200">{message}</div>}

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 md:p-8">
          {/* Account Section */}
          <h2 className="text-base font-semibold text-gray-700 mb-4">Account</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
            <Field label="Username">
              <input name="username" value={profile.username || ''} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </Field>
            <Field label="Email">
              <input name="email" type="email" value={profile.email || ''} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </Field>
            <Field label="First Name">
              <input name="firstName" value={profile.firstName || ''} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </Field>
            <Field label="Last Name">
              <input name="lastName" value={profile.lastName || ''} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </Field>
          </div>

          {/* Contact & Job Section */}
          <h2 className="text-base font-semibold text-gray-700 mb-4">Contact & Job</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
            <Field label="Phone">
              <input name="phone" value={profile.phone || ''} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </Field>
            <Field label="Department">
              <input name="department" value={profile.department || ''} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </Field>
            <Field label="Position">
              <input name="position" value={profile.position || ''} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </Field>
          </div>

          {/* Bio Section */}
          <h2 className="text-base font-semibold text-gray-700 mb-4">Bio</h2>
          <div className="grid grid-cols-1 mb-2">
            <Field label="About you">
              <textarea name="bio" value={profile.bio || ''} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
            </Field>
          </div>

          {/* Footer Save */}
          <div className="mt-4 flex justify-end">
            <button onClick={saveProfile} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Activity Log</h2>
          <div className="flex items-center gap-2">
            <select value={logFilters.action} onChange={e => setLogFilters(f => ({ ...f, action: e.target.value }))} className="border border-gray-300 rounded px-2 py-1 text-sm">
              <option value="">All actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGOUT">LOGOUT</option>
            </select>
            <input type="date" value={logFilters.from} onChange={e => setLogFilters(f => ({ ...f, from: e.target.value }))} className="border border-gray-300 rounded px-2 py-1 text-sm"/>
            <input type="date" value={logFilters.to} onChange={e => setLogFilters(f => ({ ...f, to: e.target.value }))} className="border border-gray-300 rounded px-2 py-1 text-sm"/>
            <button onClick={() => loadLogs(0)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Filter</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity ID</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Path</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logLoading ? (
                <tr><td className="px-3 py-2" colSpan="8">Loading logs...</td></tr>
              ) : (logs.content || []).length === 0 ? (
                <tr><td className="px-3 py-2" colSpan="8">No activity found.</td></tr>
              ) : (
                (logs.content || []).map((row) => (
                  <tr key={row.id}>
                    <td className="px-3 py-2 text-sm text-gray-700">{new Date(row.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{row.action}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{row.entity || '-'}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{row.entityId || '-'}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{row.path || '-'}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{row.ip || '-'}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{row.success ? 'Yes' : 'No'}</td>
                    <td className="px-3 py-2 text-xs text-gray-600 whitespace-pre-wrap break-words max-w-xs">{row.details || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Page {Number(logs.number) + 1} of {logs.totalPages || 1}
          </div>
          <div className="space-x-2">
            <button disabled={logs.number <= 0} onClick={() => loadLogs(logs.number - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
            <button disabled={logs.number >= (logs.totalPages - 1)} onClick={() => loadLogs(logs.number + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-800">Create New User</h2>
            <p className="text-sm text-gray-500 mb-4">Quickly provision a user account and assign roles.</p>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Username">
                <input value={newUser.username} onChange={e => setNewUser(u => ({ ...u, username: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </Field>
              <Field label="Email">
                <input type="email" value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </Field>
              <Field label="Password">
                <input type="password" value={newUser.password} onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </Field>
              <Field label="Roles">
                <select
                  multiple
                  value={newUser.roles || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                    setNewUser(u => ({ ...u, roles: selected }));
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {(availableRoles.length ? availableRoles : ['USER']).map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple roles.</p>
              </Field>
              <div className="flex justify-end">
                <button onClick={createUser} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Create User</button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-800">Create Role</h2>
            <p className="text-sm text-gray-500 mb-4">Define a new role to control access.</p>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Role Name">
                <input value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. ADMIN" />
              </Field>
              <div className="flex justify-end">
                <button onClick={createRole} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Create Role</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
