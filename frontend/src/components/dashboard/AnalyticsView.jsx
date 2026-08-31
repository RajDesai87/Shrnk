import React, { useState, useEffect } from 'react';
import { MousePointerClick, Calendar, TrendingUp, Trophy, BarChart2 } from 'lucide-react';
import StatCard from './StatCard';
import EmptyState from './EmptyState';
import api from '../../services/api';

export function AnalyticsView({ onOpenAnalyticsModal, onOpenCreateModal }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7d'); // '7d', '30d', '90d'

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    api.getAnalyticsOverview(range)
      .then((res) => {
        if (isCurrent) setData(res);
      })
      .catch((err) => console.error('Failed to load analytics:', err))
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [range]);

  const maxClick = data?.timeline?.reduce((m, p) => Math.max(m, p.clicks), 1) || 1;

  return (
    <div>
      {/* Header Row */}
      <div className="dash-links-header-row">
        <div>
          <h2 className="dash-greeting-title">LINK ANALYTICS</h2>
          <p className="dash-greeting-sub">Track performance and click trends across all links.</p>
        </div>

        {/* Range Selector */}
        <div className="dash-range-selector">
          <button
            type="button"
            className={`dash-range-btn ${range === '7d' ? 'active' : ''}`}
            onClick={() => setRange('7d')}
          >
            7 DAYS
          </button>
          <button
            type="button"
            className={`dash-range-btn ${range === '30d' ? 'active' : ''}`}
            onClick={() => setRange('30d')}
          >
            30 DAYS
          </button>
          <button
            type="button"
            className={`dash-range-btn ${range === '90d' ? 'active' : ''}`}
            onClick={() => setRange('90d')}
          >
            90 DAYS
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="dash-stats-grid">
        <StatCard
          label="TOTAL CLICKS"
          value={(data?.total_clicks ?? 0).toLocaleString()}
          icon={MousePointerClick}
          loading={loading}
        />
        <StatCard
          label="CLICKS TODAY"
          value={(data?.clicks_today ?? 0).toLocaleString()}
          icon={Calendar}
          loading={loading}
        />
        <StatCard
          label="CLICKS THIS WEEK"
          value={(data?.clicks_this_week ?? 0).toLocaleString()}
          icon={TrendingUp}
          loading={loading}
        />
        <StatCard
          label="TOP LINK"
          value={data?.most_clicked_link ? data.most_clicked_link.replace(/^https?:\/\//i, '') : 'None'}
          icon={Trophy}
          loading={loading}
        />
      </div>

      {/* Clicks Over Time Chart Box */}
      <div className="dash-section-box">
        <div className="dash-section-box-header">
          <div className="dash-box-title">
            <span className="dash-box-title-square">■</span>
            <span>CLICKS OVER TIME ({range.toUpperCase()})</span>
          </div>
        </div>

        <div className="dash-chart-container">
          {loading ? (
            <div className="dash-skeleton" style={{ height: '220px' }} />
          ) : data?.timeline?.length === 0 ? (
            <EmptyState
              title="NO CLICK DATA YET"
              message="Share your links to start tracking live analytics."
              onAction={onOpenCreateModal}
            />
          ) : (
            <div className="dash-bars-wrapper">
              {data?.timeline?.map((point, idx) => {
                const heightPercent = maxClick > 0 ? Math.round((point.clicks / maxClick) * 100) : 0;
                return (
                  <div key={idx} className="dash-bar-column">
                    <span className="dash-bar-value">{point.clicks}</span>
                    <div className="dash-bar-track">
                      <div
                        className="dash-bar-fill"
                        style={{ height: `${Math.max(heightPercent, point.clicks > 0 ? 6 : 0)}%` }}
                      />
                    </div>
                    <span className="dash-bar-day">{point.day}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Links Ranked Section */}
      <div className="dash-section-box">
        <div className="dash-section-box-header">
          <div className="dash-box-title">
            <span className="dash-box-title-square">■</span>
            <span>TOP PERFORMING LINKS</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '24px' }}>
            <div className="dash-skeleton" style={{ height: '40px', marginBottom: '10px' }} />
            <div className="dash-skeleton" style={{ height: '40px' }} />
          </div>
        ) : data?.top_links?.length === 0 ? (
          <EmptyState title="NO LINKS CREATED YET" message="Create your first link to see ranking data." />
        ) : (
          <div className="dash-ranked-list">
            {data?.top_links?.map((link, idx) => {
              const rankStr = String(idx + 1).padStart(2, '0');
              return (
                <div key={link.id} className="dash-ranked-item">
                  <div className="dash-ranked-left">
                    <span className="dash-rank-number">{rankStr}</span>
                    <div>
                      <span className="dash-short-badge" style={{ marginRight: '10px' }}>
                        {link.short_url.replace(/^https?:\/\//i, '')}
                      </span>
                      <span className="dash-original-url" title={link.original_url} style={{ display: 'inline-block', verticalAlign: 'middle', maxWidth: '300px' }}>
                        {link.original_url}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span className="dash-clicks-pill">
                      {link.click_count.toLocaleString()} CLICKS
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenAnalyticsModal(link.id)}
                      className="btn-table-action"
                    >
                      <BarChart2 size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                      STATS
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsView;
