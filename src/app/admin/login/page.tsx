'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPassword } from '@/app/actions/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithPassword(email, password);
      if (result.error) {
        setError('Invalid credentials. Please try again.');
      } else {
        router.push('/admin/dashboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-admin-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
    }}>
      <div className="animate-slide-up" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{
          background: 'var(--color-admin-surface)',
          border: '1px solid var(--color-admin-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
        }}>
          <div className="text-center" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ color: 'var(--color-admin-accent)', marginBottom: '0.25rem' }}>
              Admin Login
            </h2>
            <p style={{ color: 'var(--color-admin-text-secondary)', fontSize: '0.9rem' }}>
              Koppal Ganapathi Utsava 2026
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="admin-form-label" htmlFor="admin-email">Email</label>
              <input
                type="email"
                id="admin-email"
                className="admin-form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoFocus
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="admin-form-label" htmlFor="admin-password">Password</label>
              <input
                type="password"
                id="admin-password"
                className="admin-form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="alert alert-error mb-lg" style={{ fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
