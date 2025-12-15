import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/apiConfig';

const normalizeRoleName = (name) => {
  if (!name) return '';
  const trimmed = name.trim().toUpperCase();
  return trimmed.startsWith('ROLE_') ? trimmed : `ROLE_${trimmed}`;
};

const RoleForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [role, setRole] = useState({ name: '' });
  const [loading, setLoading] = useState(!!isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/roles/${id}`);
        setRole({ name: data?.name || '' });
        setError('');
      } catch (e) {
        console.error('Failed to load role', e);
        setError('Failed to load role');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = { name: normalizeRoleName(role.name) };
      if (isEdit) {
        await API.put(`/roles/${id}`, payload);
      } else {
        await API.post('/roles', payload);
      }
      navigate('/roles');
    } catch (e2) {
      console.error('Failed to save role', e2);
      setError('Failed to save role');
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

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">{isEdit ? 'Edit Role' : 'New Role'}</h1>
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">{error}</div>
      )}
      <form onSubmit={onSubmit} className="bg-white shadow rounded-lg p-6 space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-gray-700">Role Name</label>
          <input
            value={role.name}
            onChange={(e) => setRole({ ...role, name: e.target.value })}
            placeholder="e.g., ADMIN or ROLE_ADMIN"
            className="mt-1 block w-full border rounded px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">Will be saved as: <strong>{normalizeRoleName(role.name) || 'ROLE_'}</strong></p>
        </div>
        <div className="flex space-x-3">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">
            {saving ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
          </button>
          <button type="button" onClick={() => navigate('/roles')} className="px-4 py-2 bg-gray-200 text-gray-700 rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default RoleForm;
