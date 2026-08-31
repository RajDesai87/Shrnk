import React, { useState, useEffect, useCallback } from 'react';
import { Plus, BarChart2, Trash2, Search, X } from 'lucide-react';
import EmptyState from './EmptyState';
import api from '../../services/api';

function getLinkStatus(link, now) {
  if (link.is_active === false || link.status === 'DISABLED') return 'DISABLED';
  if (link.expires_at) {
    const exp = new Date(link.expires_at);
    if (exp <= now || link.status === 'EXPIRED') return 'EXPIRED';
  }
  return link.status || 'ACTIVE';
}

function formatExpirationText(expiresAt, status, now) {
  if (!expiresAt) return 'Never';
  const exp = new Date(expiresAt);
  
  if (status === 'EXPIRED' || exp <= now) {
    return `Expired on ${exp.toLocaleDateString()}`;
  }
  
  const diffMs = exp - now;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours < 24 && diffHours >= 0) {
    if (diffHours === 0) {
      return `${Math.max(diffMins, 1)}m remaining`;
    }
    return `${diffHours}h ${diffMins}m remaining`;
  }
  return exp.toLocaleDateString();
}

export function LinksView({ onOpenCreateModal, onOpenAnalyticsModal, externalSearch = '' }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'expired', 'disabled'
  const [search, setSearch] = useState(externalSearch);
  const [copiedId, setCopiedId] = useState(null);
  const [now, setNow] = useState(() => new Date());
  
  // Delete confirmation modal state
  const [deletingLink, setDeletingLink] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Live timer tick to ensure UI expiration transitions in real time
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getUrls(filter, search);
      setLinks(res);
    } catch (err) {
      console.error('Failed to load links:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  useEffect(() => {
    if (externalSearch !== undefined) {
      setSearch(externalSearch);
    }
  }, [externalSearch]);

  const handleCopy = (link) => {
    navigator.clipboard.writeText(link.short_url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const confirmDelete = async () => {
    if (!deletingLink) return;
    try {
      setIsDeleting(true);
      setDeleteError('');
      await api.deleteUrl(deletingLink.id);
      setLinks((prev) => prev.filter((l) => l.id !== deletingLink.id));
      setDeletingLink(null);
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete URL.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Header Row */}
      <div className="dash-links-header-row">
        <div>
          <h2 className="dash-greeting-title">YOUR LINKS</h2>
          <p className="dash-greeting-sub">Every link you've shrunk.</p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="btn-topbar-action"
        >
          <Plus size={18} strokeWidth={3} />
          <span>SHRNK URL</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="dash-links-header-row" style={{ marginTop: '12px', marginBottom: '20px' }}>
        <div className="dash-filter-tabs">
          <button
            type="button"
            className={`dash-filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            ALL ({links.length})
          </button>
          <button
            type="button"
            className={`dash-filter-tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            ACTIVE
          </button>
          <button
            type="button"
            className={`dash-filter-tab ${filter === 'expired' ? 'active' : ''}`}
            onClick={() => setFilter('expired')}
          >
            EXPIRED
          </button>
          <button
            type="button"
            className={`dash-filter-tab ${filter === 'disabled' ? 'active' : ''}`}
            onClick={() => setFilter('disabled')}
          >
            DISABLED
          </button>
        </div>

        {/* Search input in view */}
        <div className="dash-search-box" style={{ width: '280px' }}>
          <Search size={16} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by URL or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="dash-search-input"
            style={{ width: '100%' }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Links Table Box */}
      <div className="dash-section-box">
        {loading ? (
          <div style={{ padding: '30px' }}>
            <div className="dash-skeleton" style={{ height: '44px', marginBottom: '12px' }} />
            <div className="dash-skeleton" style={{ height: '44px', marginBottom: '12px' }} />
            <div className="dash-skeleton" style={{ height: '44px' }} />
          </div>
        ) : links.length === 0 ? (
          <EmptyState
            title={search ? "NO MATCHING LINKS FOUND." : "NOTHING SHRUNK YET."}
            message={search ? "Try searching for a different term or clear the filter." : "Your first tiny URL is one click away."}
            onAction={onOpenCreateModal}
            actionLabel="+ SHRNK URL →"
          />
        ) : (
          <div className="dash-table-wrapper">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>ORIGINAL URL</th>
                  <th>SHORT LINK</th>
                  <th>CLICKS</th>
                  <th>CREATED</th>
                  <th>EXPIRES</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => {
                  const effectiveStatus = getLinkStatus(link, now);
                  const statusClass = effectiveStatus.toLowerCase();
                  return (
                    <tr key={link.id}>
                      <td>
                        <span className="dash-original-url" title={link.original_url}>
                          {link.original_url}
                        </span>
                      </td>
                      <td>
                        <span className="dash-short-badge">
                          {link.short_url.replace(/^https?:\/\//i, '')}
                        </span>
                      </td>
                      <td>
                        <span className="dash-clicks-pill">
                          {link.click_count.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: 'var(--dash-text-muted)', fontWeight: 600 }}>
                          {new Date(link.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: 'var(--dash-text-muted)', fontWeight: 600 }}>
                          {formatExpirationText(link.expires_at, effectiveStatus, now)}
                        </span>
                      </td>
                      <td>
                        <span className={`dash-status-pill ${statusClass}`}>
                          {effectiveStatus}
                        </span>
                      </td>
                      <td>
                        <div className="dash-actions-group">
                          <button
                            type="button"
                            onClick={() => handleCopy(link)}
                            className={`btn-table-action ${copiedId === link.id ? 'copied' : ''}`}
                            title="Copy short link"
                          >
                            {copiedId === link.id ? 'COPIED' : 'COPY'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenAnalyticsModal(link.id)}
                            className="btn-table-action"
                            title="View link analytics"
                          >
                            <BarChart2 size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                            STATS
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingLink(link)}
                            className="btn-table-action danger"
                            title="Delete link"
                            aria-label="Delete link"
                          >
                            <Trash2 size={13} style={{ color: 'var(--dash-danger)' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingLink && (
        <div className="dash-modal-overlay" onClick={() => setDeletingLink(null)}>
          <div 
            className="dash-modal-box" 
            style={{ maxWidth: '420px' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="dash-modal-header">
              <h3 className="dash-modal-title" style={{ color: 'var(--dash-danger)' }}>
                DELETE LINK?
              </h3>
              <button 
                type="button" 
                className="btn-modal-close" 
                onClick={() => setDeletingLink(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="dash-modal-body">
              {deleteError && (
                <div style={{
                  backgroundColor: '#FFE5E5',
                  border: '2px solid #FF4444',
                  padding: '8px 12px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  color: '#CC0000',
                  marginBottom: '14px',
                }}>
                  {deleteError}
                </div>
              )}
              <p style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '8px' }}>
                Are you sure you want to delete this link?
              </p>
              <div className="dash-short-badge" style={{ marginBottom: '16px' }}>
                {deletingLink.short_url.replace(/^https?:\/\//i, '')}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--dash-text-muted)', marginBottom: '24px' }}>
                This cannot be undone. All click analytics will also be permanently deleted.
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setDeletingLink(null)}
                  className="btn-table-action"
                  style={{ flex: 1, padding: '12px' }}
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="btn-dash-save"
                  style={{ flex: 1, padding: '12px', backgroundColor: 'var(--dash-danger)', color: '#FFFFFF' }}
                >
                  {isDeleting ? 'DELETING...' : 'DELETE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LinksView;
