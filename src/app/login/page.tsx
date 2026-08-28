'use client';

import { useState } from 'react';
import { signInWithEmail } from '@/app/actions/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithEmail(email);
      if (result.error) {
        setError(result.error);
      } else {
        setEmailSent(true);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="festive-bg">
      <div className="page-wrapper">
        <div className="page-content flex items-center justify-center" style={{ minHeight: '85vh' }}>
          <div className="container-narrow animate-slide-up">
            <div className="card card-elevated" style={{ maxWidth: 440, margin: '0 auto' }}>
              {emailSent ? (
                <div className="text-center" style={{ padding: '1rem 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
                  <h2 style={{ marginBottom: '0.75rem' }}>Check Your Email</h2>
                  <p style={{ marginBottom: '1.5rem', lineHeight: 1.7 }}>
                    We&apos;ve sent a magic link to <strong>{email}</strong>.
                    Click the link in the email to continue with your evaluation.
                  </p>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                    Didn&apos;t receive it? Check your spam folder or{' '}
                    <button
                      type="button"
                      onClick={() => { setEmailSent(false); setEmail(''); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-orange)',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        font: 'inherit',
                        padding: 0,
                      }}
                    >
                      try again
                    </button>.
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center" style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ marginBottom: '0.25rem' }}>Public Evaluation</h2>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                      Enter your email to continue
                    </p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="form-input"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                        autoComplete="email"
                        disabled={loading}
                      />
                    </div>

                    {error && (
                      <div className="alert alert-error mb-lg">{error}</div>
                    )}

                    <button
                      type="submit"
                      className="btn btn-primary btn-full btn-lg"
                      disabled={loading || !email}
                      id="continue-btn"
                    >
                      {loading ? 'Sending...' : 'Continue'}
                    </button>
                  </form>

                  <p className="text-muted text-center mt-lg" style={{ fontSize: '0.8rem' }}>
                    We&apos;ll send you a magic link to verify your email.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
