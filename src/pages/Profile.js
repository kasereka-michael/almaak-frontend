import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserService from '../services/userService';
import API from '../services/apiConfig';

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

  const isAdmin = useMemo(() => {
    const roles = authUser?.roles || [];
    return Array.isArray(roles) && roles.includes('ADMIN');
  }, [authUser]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await UserService.getCurrentUserProfile();
        if (mounted) setProfile(me);
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
      const { data } = await API.post('/api/roles', { name: newRole });
      setMessage(`Role ${data?.name || newRole} created`);
      setNewRole('');
    } catch (e) {
      setError(e.message || 'Failed to create role');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>No profile</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">My Profile</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>}
      {message && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">{message}</div>}

      <div className="bg-white p-6 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="First Name">
            <input name="firstName" value={profile.firstName || ''} onChange={onChange} className="w-full border rounded px-3 py-2" />
          </Field>
          <Field label="Last Name">
            <input name="lastName" value={profile.lastName || ''} onChange={onChange} className="w-full border rounded px-3 py-2" />
          </Field>
          <Field label="Email">
            <input name="email" type="email" value={profile.email || ''} onChange={onChange} className="w-full border rounded px-3 py-2" />
          </Field>
          <Field label="Username">
            <input name="username" value={profile.username || ''} onChange={onChange} className="w-full border rounded px-3 py-2" />
          </Field>
          <Field label="Phone">
            <input name="phone" value={profile.phone || ''} onChange={onChange} className="w-full border rounded px-3 py-2" />
          </Field>
          <Field label="Department">
            <input name="department" value={profile.department || ''} onChange={onChange} className="w-full border rounded px-3 py-2" />
          </Field>
          <Field label="Position">
            <input name="position" value={profile.position || ''} onChange={onChange} className="w-full border rounded px-3 py-2" />
          </Field>
          <Field label="Bio">
            <textarea name="bio" value={profile.bio || ''} onChange={onChange} className="w-full border rounded px-3 py-2"></textarea>
          </Field>
        </div>
        <div className="mt-4">
          <button onClick={saveProfile} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {isAdmin && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Create New User</h2>
            <Field label="Username">
              <input value={newUser.username} onChange={e => setNewUser(u => ({ ...u, username: e.target.value }))} className="w-full border rounded px-3 py-2" />
            </Field>
            <Field label="Email">
              <input type="email" value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))} className="w-full border rounded px-3 py-2" />
            </Field>
            <Field label="Password">
              <input type="password" value={newUser.password} onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))} className="w-full border rounded px-3 py-2" />
            </Field>
            <Field label="Roles (comma separated)">
              <input value={(newUser.roles || []).join(',')} onChange={e => setNewUser(u => ({ ...u, roles: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} className="w-full border rounded px-3 py-2" />
            </Field>
            <button onClick={createUser} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Create User</button>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Create Role</h2>
            <Field label="Role Name">
              <input value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="e.g. ADMIN" />
            </Field>
            <button onClick={createRole} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Create Role</button>
          </div>
        </div>
      )}
    </div>
  );
}
