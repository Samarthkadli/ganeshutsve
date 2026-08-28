'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAllMandals,
  createMandal,
  updateMandal,
  toggleMandal,
  deleteMandal,
} from '@/app/actions/mandals';
import { signOut } from '@/app/actions/auth';
import type { Mandal, MandalFormData } from '@/types/database';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function MandalManagementPage() {
  const router = useRouter();
  const [mandals, setMandals] = useState<Mandal[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMandal, setEditingMandal] = useState<Mandal | null>(null);
  const [formData, setFormData] = useState<MandalFormData>({
    name: '',
    area: '',
    description: '',
    image_url: '',
    is_active: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchMandals = async () => {
    try {
      const result = await getAllMandals();
      setMandals(result.mandals);
    } catch {
      setActionError('Failed to load mandals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMandals();
  }, []);

  const openCreateForm = () => {
    setEditingMandal(null);
    setFormData({ name: '', area: '', description: '', image_url: '', is_active: true });
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (mandal: Mandal) => {
    setEditingMandal(mandal);
    setFormData({
      name: mandal.name,
      area: mandal.area,
      description: mandal.description,
      image_url: mandal.image_url,
      is_active: mandal.is_active,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Mandal name is required.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      let result;
      if (editingMandal) {
        result = await updateMandal(editingMandal.id, formData);
      } else {
        result = await createMandal(formData);
      }

      if (result.error) {
        setFormError(result.error);
      } else {
        setShowForm(false);
        await fetchMandals();
      }
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggle = async (mandal: Mandal) => {
    setActionError('');
    const result = await toggleMandal(mandal.id, !mandal.is_active);
    if (result.error) {
      setActionError(result.error);
    } else {
      await fetchMandals();
    }
  };

  const handleDelete = async (mandal: Mandal) => {
    setActionError('');
    const confirmed = window.confirm(
      `Are you sure you want to delete "${mandal.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    const result = await deleteMandal(mandal.id);
    if (result.error) {
      setActionError(result.error);
    } else {
      await fetchMandals();
    }
  };

  const filteredMandals = search.trim()
    ? mandals.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.area.toLowerCase().includes(search.toLowerCase())
      )
    : mandals;

  if (loading) {
    return (
      <div className="admin-layout">
        <LoadingSpinner message="Loading mandals..." />
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <span className="admin-header-title">🏛️ Koppal Ganapathi Utsava 2026 — Admin</span>
        <nav className="admin-nav">
          <button className="admin-nav-link" onClick={() => router.push('/admin/dashboard')}>
            Dashboard
          </button>
          <button className="admin-nav-link active" onClick={() => router.push('/admin/mandals/manage')}>
            Manage Mandals
          </button>
          <button className="admin-nav-link" onClick={() => signOut()}>
            Sign Out
          </button>
        </nav>
      </header>

      {/* Content */}
      <div className="admin-content">
        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="admin-page-title">Manage Mandals</h1>
            <p className="admin-page-subtitle" style={{ marginBottom: 0 }}>
              Add, edit, or manage participating mandals
            </p>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={openCreateForm}>
            + Add Mandal
          </button>
        </div>

        {actionError && (
          <div className="alert alert-error mb-lg" style={{ fontSize: '0.875rem' }}>{actionError}</div>
        )}

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
                <th>Mandal Name</th>
                <th>Area</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMandals.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-admin-text-secondary)' }}>
                    {search ? 'No mandals matching search.' : 'No mandals found. Add one to get started.'}
                  </td>
                </tr>
              ) : (
                filteredMandals.map((mandal) => (
                  <tr key={mandal.id} style={{ cursor: 'default' }}>
                    <td style={{ fontWeight: 500 }}>{mandal.name}</td>
                    <td style={{ color: 'var(--color-admin-text-secondary)' }}>{mandal.area || '—'}</td>
                    <td>
                      <button
                        className={`toggle ${mandal.is_active ? 'active' : ''}`}
                        onClick={() => handleToggle(mandal)}
                        aria-label={`Toggle ${mandal.name} ${mandal.is_active ? 'off' : 'on'}`}
                        title={mandal.is_active ? 'Click to disable' : 'Click to enable'}
                      />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex gap-sm" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="admin-btn admin-btn-secondary"
                          onClick={() => openEditForm(mandal)}
                          style={{ padding: '0.4rem 0.8rem', minHeight: 'auto', fontSize: '0.8rem' }}
                        >
                          Edit
                        </button>
                        <button
                          className="admin-btn admin-btn-danger"
                          onClick={() => handleDelete(mandal)}
                          style={{ padding: '0.4rem 0.8rem', minHeight: 'auto', fontSize: '0.8rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">
              {editingMandal ? 'Edit Mandal' : 'Add New Mandal'}
            </h3>

            <form onSubmit={handleSubmitForm}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="admin-form-label" htmlFor="mandal-name">Mandal Name *</label>
                <input
                  type="text"
                  id="mandal-name"
                  className="admin-form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter mandal name"
                  required
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="admin-form-label" htmlFor="mandal-area">Area / Location</label>
                <input
                  type="text"
                  id="mandal-area"
                  className="admin-form-input"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="Enter area or location"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="admin-form-label" htmlFor="mandal-desc">Description</label>
                <textarea
                  id="mandal-desc"
                  className="admin-form-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                  rows={3}
                  style={{ resize: 'vertical', minHeight: 80 }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="admin-form-label" htmlFor="mandal-image">Image URL (optional)</label>
                <input
                  type="url"
                  id="mandal-image"
                  className="admin-form-input"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div className="toggle-wrapper">
                  <button
                    type="button"
                    className={`toggle ${formData.is_active ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  />
                  <span style={{ color: 'var(--color-admin-text)', fontSize: '0.9rem' }}>
                    {formData.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {formError && (
                <div className="alert alert-error mb-lg" style={{ fontSize: '0.85rem' }}>
                  {formError}
                </div>
              )}

              <div className="flex gap-md" style={{ justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setShowForm(false)}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={formLoading}
                >
                  {formLoading
                    ? 'Saving...'
                    : editingMandal
                    ? 'Update Mandal'
                    : 'Add Mandal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
