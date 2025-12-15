import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/apiConfig';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/users/${id}`);
        setUser(data);
        setError('');
      } catch (e) {
        console.error('Failed to load user', e);
        setError('Failed to load user');
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
      await API.put(`/users/${id}`, user);
      navigate('/users');
    } catch (e2) {
      console.error('Failed to save user', e2);
      setError('Failed to save user');
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
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input name="name" value={user.name || ''} onChange={onChange} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input name="email" type="email" value={user.email || ''} onChange={onChange} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input name="username" value={user.username || ''} onChange={onChange} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <input name="role" value={user.role || ''} onChange={onChange} className="mt-1 block w-full border rounded px-3 py-2" />
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
