'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getMandalDetail } from '@/app/actions/mandals';
import { signOut } from '@/app/actions/auth';
import { EVALUATION_QUESTIONS, maskEmail } from '@/lib/config';
import type { MandalStats, ReviewWithEmail } from '@/types/database';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function MandalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const mandalId = params.id as string;

  const [stats, setStats] = useState<MandalStats | null>(null);
  const [reviews, setReviews] = useState<ReviewWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getMandalDetail(mandalId);
        if (result.error) {
          setError(result.error);
        } else {
          setStats(result.stats);
          setReviews(result.reviews);
        }
      } catch {
        setError('Failed to load mandal details.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [mandalId]);

  if (loading) {
    return (
      <div className="admin-layout">
        <LoadingSpinner message="Loading mandal details..." />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="admin-layout">
        <div className="admin-content">
          <div className="alert alert-error">{error || 'Mandal not found.'}</div>
          <button className="admin-btn admin-btn-secondary mt-lg" onClick={() => router.push('/admin/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const categoryAverages = [
    { label: 'Ganesha Idol', value: stats.avg_idol },
    { label: 'Decoration', value: stats.avg_decoration },
    { label: 'Lighting', value: stats.avg_lighting },
    { label: 'Creativity', value: stats.avg_creativity },
    { label: 'Cleanliness', value: stats.avg_cleanliness },
    { label: 'Eco-Friendly', value: stats.avg_eco_friendly },
    { label: 'Cultural Activities', value: stats.avg_cultural },
    { label: 'Overall Experience', value: stats.avg_overall },
  ];

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <span className="admin-header-title">🏛️ Koppal Ganapathi Utsava 2026 — Admin</span>
        <nav className="admin-nav">
          <button className="admin-nav-link" onClick={() => router.push('/admin/dashboard')}>
            Dashboard
          </button>
          <button className="admin-nav-link" onClick={() => router.push('/admin/mandals/manage')}>
            Manage Mandals
          </button>
          <button className="admin-nav-link" onClick={() => signOut()}>
            Sign Out
          </button>
        </nav>
      </header>

      {/* Content */}
      <div className="admin-content">
        <button
          className="back-link"
          onClick={() => router.push('/admin/dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
        >
          ← Back to Dashboard
        </button>

        <h1 className="admin-page-title">{stats.name}</h1>
        <p className="admin-page-subtitle">{stats.area}</p>

        {/* Summary stats */}
        <div className="admin-stats-grid" style={{ maxWidth: 500 }}>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Total Reviews</div>
            <div className="admin-stat-value">{stats.total_reviews}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Average Rating</div>
            <div className="admin-stat-value">
              {Number(stats.average_rating) > 0 ? `${Number(stats.average_rating).toFixed(2)} / 5` : '—'}
            </div>
          </div>
        </div>

        {/* Category averages */}
        <h3 style={{ color: 'var(--color-admin-text)', marginBottom: '1rem' }}>Category Averages</h3>
        <div className="admin-table-wrapper mb-xl">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Average</th>
              </tr>
            </thead>
            <tbody>
              {categoryAverages.map((cat) => (
                <tr key={cat.label} style={{ cursor: 'default' }}>
                  <td>{cat.label}</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {Number(cat.value) > 0 ? `${Number(cat.value).toFixed(2)} ⭐` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Individual reviews */}
        <h3 style={{ color: 'var(--color-admin-text)', marginBottom: '1rem' }}>
          Individual Reviews ({reviews.length})
        </h3>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Email</th>
                {EVALUATION_QUESTIONS.map((q) => (
                  <th key={q.id} style={{ textAlign: 'center' }}>{q.shortLabel}</th>
                ))}
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={EVALUATION_QUESTIONS.length + 3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-admin-text-secondary)' }}>
                    No reviews yet.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => {
                  const email = review.profiles?.email || 'Unknown';
                  return (
                    <tr key={review.id} style={{ cursor: 'default' }}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                        {new Date(review.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {maskEmail(email)}
                      </td>
                      <td style={{ textAlign: 'center' }}>{review.idol_rating}</td>
                      <td style={{ textAlign: 'center' }}>{review.decoration_rating}</td>
                      <td style={{ textAlign: 'center' }}>{review.lighting_rating}</td>
                      <td style={{ textAlign: 'center' }}>{review.creativity_rating}</td>
                      <td style={{ textAlign: 'center' }}>{review.cleanliness_rating}</td>
                      <td style={{ textAlign: 'center' }}>{review.eco_friendly_rating}</td>
                      <td style={{ textAlign: 'center' }}>{review.cultural_rating}</td>
                      <td style={{ textAlign: 'center' }}>{review.overall_rating}</td>
                      <td style={{ fontSize: '0.8rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {review.feedback || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
