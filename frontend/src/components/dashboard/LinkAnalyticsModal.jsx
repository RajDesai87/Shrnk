import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';

export function LinkAnalyticsModal({ urlId, isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && urlId) {
      setLoading(true);
      setError('');
      api.getUrlAnalytics(urlId)
        .then((res) => setData(res))
        .catch((err) => setError(err.message || 'Failed to load link analytics.'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, urlId]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (data?.short_url) {
      navigator.clipboard.writeText(data.short_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const maxClick = data?.timeline?.reduce((m, p) => Math.max(m, p.clicks), 1) || 1;

  return (
    <div className="dash-modal-overlay" onClick={onClose}>
      <div 
        className="dash-modal-box" 
        style={{ maxWidth: '640px' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="dash-modal-header">
          <h3 className="dash-modal-title">LINK ANALYTICS</h3>
          <button type="button" className="btn-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="dash-modal-body">
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <div className="dash-empty-title">LOADING ANALYTICS...</div>
            </div>
          ) : error ? (
            <div style={{ padding: '20px', color: '#CC0000', fontWeight: 800 }}>{error}</div>
          ) : data ? (
            <div>
              {/* Header Info */}
              <div style={{ marginBottom: '20px', borderBottom: '2px solid #0D0D0D', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="dash-short-badge" style={{ fontSize: '0.95rem' }}>
                      {data.short_url.replace(/^https?:\/\//i, '')}
                    </span>
                    <span className={`dash-status-pill ${(data.status || (data.is_active ? 'ACTIVE' : 'EXPIRED')).toLowerCase()}`}>
                      {data.status || (data.is_active ? 'ACTIVE' : 'EXPIRED')}
                    </span>
                  </div>
                  <button type="button" onClick={handleCopy} className={`btn-table-action ${copied ? 'copied' : ''}`}>
                    {copied ? 'COPIED!' : 'COPY'}
                  </button>
                </div>
                <div className="dash-original-url" title={data.original_url} style={{ maxWidth: '100%' }}>
                  {data.original_url}
                </div>
              </div>

              {/* 4 Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                <div className="dash-stat-card" style={{ padding: '12px' }}>
                  <span className="dash-stat-label">TOTAL</span>
                  <span className="dash-stat-value" style={{ fontSize: '1.5rem' }}>{data.total_clicks}</span>
                </div>
                <div className="dash-stat-card" style={{ padding: '12px' }}>
                  <span className="dash-stat-label">TODAY</span>
                  <span className="dash-stat-value" style={{ fontSize: '1.5rem' }}>{data.clicks_today}</span>
                </div>
                <div className="dash-stat-card" style={{ padding: '12px' }}>
                  <span className="dash-stat-label">THIS WEEK</span>
                  <span className="dash-stat-value" style={{ fontSize: '1.5rem' }}>{data.clicks_this_week}</span>
                </div>
                <div className="dash-stat-card" style={{ padding: '12px' }}>
                  <span className="dash-stat-label">THIS MONTH</span>
                  <span className="dash-stat-value" style={{ fontSize: '1.5rem' }}>{data.clicks_this_month}</span>
                </div>
              </div>

              {/* 7-Day Mini Chart */}
              <div style={{ border: '2px solid #0D0D0D', padding: '16px', backgroundColor: '#FAF8F5', marginBottom: '20px' }}>
                <div style={{ fontWeight: 900, fontSize: '0.82rem', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  CLICKS / LAST 7 DAYS
                </div>
                <div className="dash-bars-wrapper" style={{ height: '140px' }}>
                  {data.timeline?.map((point, idx) => {
                    const heightPercent = maxClick > 0 ? Math.round((point.clicks / maxClick) * 100) : 0;
                    return (
                      <div key={idx} className="dash-bar-column">
                        <span className="dash-bar-value">{point.clicks}</span>
                        <div className="dash-bar-track" style={{ height: '90px', maxWidth: '32px' }}>
                          <div className="dash-bar-fill" style={{ height: `${Math.max(heightPercent, 4)}%` }} />
                        </div>
                        <span className="dash-bar-day">{point.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Referrers & Devices */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Referrers */}
                <div style={{ border: '2px solid #0D0D0D', padding: '14px', backgroundColor: '#FFFFFF' }}>
                  <div style={{ fontWeight: 900, fontSize: '0.78rem', letterSpacing: '0.06em', marginBottom: '10px' }}>
                    TOP REFERRERS
                  </div>
                  {data.top_referrers?.length > 0 ? (
                    data.top_referrers.map((ref, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700 }}>{ref.referrer}</span>
                        <span style={{ fontFamily: 'var(--dash-font-mono)', fontWeight: 800 }}>{ref.count} ({ref.percentage}%)</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--dash-text-muted)' }}>No referrer data yet.</div>
                  )}
                </div>

                {/* Devices */}
                <div style={{ border: '2px solid #0D0D0D', padding: '14px', backgroundColor: '#FFFFFF' }}>
                  <div style={{ fontWeight: 900, fontSize: '0.78rem', letterSpacing: '0.06em', marginBottom: '10px' }}>
                    DEVICES
                  </div>
                  {data.devices?.map((dev, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700 }}>{dev.device}</span>
                      <span style={{ fontFamily: 'var(--dash-font-mono)', fontWeight: 800 }}>{dev.count} ({dev.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default LinkAnalyticsModal;
