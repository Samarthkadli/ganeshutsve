'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getDashboardStats, getMandalStats } from '@/app/actions/mandals';
import { signOut } from '@/app/actions/auth';
import type { MandalStats } from '@/types/database';
import LoadingSpinner from '@/components/LoadingSpinner';

type SortKey = 'name' | 'total_reviews' | 'average_rating';
type SortDir = 'asc' | 'desc';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalMandals: 0,
    totalReviews: 0,
    overallAverage: 0,
    mostReviewed: null as { name: string; count: number } | null,
  });
  const [mandals, setMandals] = useState<MandalStats[]>([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('total_reviews');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [dashStats, mandalStats] = await Promise.all([
        getDashboardStats(),
        getMandalStats(),
      ]);
      setStats(dashStats);
      setMandals(mandalStats.stats);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const sortedMandals = useMemo(() => {
    let filtered = mandals;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = mandals.filter(
        (m) => m.name.toLowerCase().includes(q) || m.area.toLowerCase().includes(q)
      );
    }

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === 'total_reviews') {
        cmp = Number(a.total_reviews) - Number(b.total_reviews);
      } else {
        cmp = Number(a.average_rating) - Number(b.average_rating);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [mandals, search, sortKey, sortDir]);

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <span className="admin-header-title">🏛️ Koppal Ganapathi Utsava 2026 — Admin</span>
        <nav className="admin-nav">
          <button className="admin-nav-link active" onClick={() => router.push('/admin/dashboard')}>
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
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">Public evaluation overview</p>

        {/* Stats */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-label">Total Mandals</div>
            <div className="admin-stat-value">{stats.totalMandals}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Total Reviews</div>
            <div className="admin-stat-value">{stats.totalReviews}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Average Rating</div>
            <div className="admin-stat-value">{stats.overallAverage.toFixed(2)} ⭐</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Most Reviewed</div>
            <div className="admin-stat-value" style={{ fontSize: '1.1rem' }}>
              {stats.mostReviewed?.name || '—'}
            </div>
            {stats.mostReviewed && (
              <div className="admin-stat-sub">{stats.mostReviewed.count} reviews</div>
            )}
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1rem' }}>
          <div className="search-wrapper" style={{ maxWidth: 350 }}>
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              className="admin-search"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search mandals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Mandal table */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th
                  className={`sortable ${sortKey === 'name' ? 'sorted' : ''}`}
                  onClick={() => handleSort('name')}
                >
                  Mandal{sortIndicator('name')}
                </th>
                <th
                  className={`sortable ${sortKey === 'total_reviews' ? 'sorted' : ''}`}
                  onClick={() => handleSort('total_reviews')}
                  style={{ textAlign: 'right' }}
                >
                  Total Reviews{sortIndicator('total_reviews')}
                </th>
                <th
                  className={`sortable ${sortKey === 'average_rating' ? 'sorted' : ''}`}
                  onClick={() => handleSort('average_rating')}
                  style={{ textAlign: 'right' }}
                >
                  Average Rating{sortIndicator('average_rating')}
                </th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedMandals.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-admin-text-secondary)' }}>
                    {search ? 'No mandals matching search.' : 'No mandals found.'}
                  </td>
                </tr>
              ) : (
                sortedMandals.map((m) => (
                  <tr key={m.id} onClick={() => router.push(`/admin/mandals/${m.id}`)}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{m.name}</div>
                      {m.area && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-admin-text-secondary)' }}>
                          {m.area}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {m.total_reviews}
                    </td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {Number(m.average_rating) > 0 ? `${Number(m.average_rating).toFixed(2)} ⭐` : '—'}
                    </td>
                    <td>
                      <span className={`badge ${m.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {m.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
