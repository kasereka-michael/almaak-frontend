import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await login(username, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setLocalError(err?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden md:flex items-center justify-center bg-gray-900 p-10">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,_rgba(255,255,255,0.2)_0,_transparent_40%),_radial-gradient(circle_at_80%_0,_rgba(255,255,255,0.15)_0,_transparent_35%)]" />
          <div className="relative text-center">
            <img src="/logo.jpeg" alt="ALMAAK Corporation" className="mx-auto w-50 h-50 object-contain drop-shadow-lg" />
            <h2 className="mt-6 text-white text-3xl font-extrabold tracking-wide">ALMAAK CORPORATION</h2>
            <p className="mt-2 text-gray-300">Enterprise Management System</p>
          </div>
        </div>

        {/* Form panel */}
        <div className="p-8 md:p-10">
          <div className="mb-8 flex items-center md:hidden">
            <img src="/logo.jpeg" alt="ALMAAK Corporation" className="w-10 h-10 object-contain mr-3" />
            <div>
              <div className="text-gray-900 text-xl font-bold leading-tight">ALMAAK CORPORATION</div>
              <div className="text-gray-500 text-sm -mt-1">Enterprise Management System</div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-6">Sign in to your account</h1>
          {(error || localError) && (
            <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
              {error || localError}
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=""
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 text-sm text-gray-600"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          {/* Helper text removed to keep login page clean */}
        </div>
      </div>
    </div>
  );
}
