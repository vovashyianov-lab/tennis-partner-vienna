import React, { useState } from 'react';
import Modal from './modals/Modal';
import { useAuth } from '../hooks/useAuth';

interface LoginFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  onRegisterClick: () => void;
}

export default function LoginForm({ isOpen, onClose, onSubmit, onRegisterClick }: LoginFormProps) {
  const { signInWithGoogle } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ email, password });
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Welcome back">
      <form onSubmit={handleSubmit} className="space-y-5">

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 font-medium text-gray-700 text-sm"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleLoading ? 'Connecting...' : 'Continue with Google'}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white text-xs text-gray-400 uppercase tracking-wider">or</span>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tennis-400 focus:border-transparent transition-shadow"
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tennis-400 focus:border-transparent transition-shadow"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-tennis-600 text-white py-2.5 px-4 rounded-xl font-medium text-sm hover:bg-tennis-700 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        <p className="text-center text-sm text-gray-500">
          No account?{' '}
          <button
            type="button"
            onClick={onRegisterClick}
            className="text-tennis-600 hover:text-tennis-800 font-medium transition-colors"
          >
            Sign up
          </button>
        </p>

      </form>
    </Modal>
  );
}
