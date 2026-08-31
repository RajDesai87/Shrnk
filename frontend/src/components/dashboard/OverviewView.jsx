import React, { useState, useEffect } from 'react';
import { Link2, MousePointerClick, CheckCircle2, TrendingUp, BarChart2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatCard from './StatCard';
import EmptyState from './EmptyState';
import api from '../../services/api';

export function OverviewView({ onOpenCreateModal, onOpenAnalyticsModal, onNavigate }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCopy = (link) => {
    navigator.clipboard.writeText(link.short_url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Compute greeting based on local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 18) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  const userName = user?.name ? user.name.split(' ')[0].toUpperCase() : 'CREATOR';

  return (
    <div>
      {/* Greeting Block */}
      <div className="dash-greeting-block">
        <h2 className="dash-greeting-title">
          {getGreeting()}, {userName}.
        </h2>
        <p className="dash-greeting-sub">
          Here's what's happening with your links.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="dash-stats-grid">
        <StatCard
          label="TOTAL LINKS"
          value={data?.total_links ?? 0}
          icon={Link2}
          loading={loading}
        />
        <StatCard
          label="TOTAL CLICKS"
          value={(data?.total_clicks ?? 0).toLocaleString()}
          icon={MousePointerClick}
          loading={loading}
        />
        <StatCard
          label="ACTIVE LINKS"
          value={data?.active_links ?? 0}
          icon={CheckCircle2}
          loading={loading}
        />
        <StatCard
          label="THIS WEEK"
          value={(data?.clicks_this_week ?? 0).toLocaleString()}
          icon={TrendingUp}
          loading={loading}
        />
      </div>

      {/* Recent Links Box */}
      <div className="dash-section-box">
        <div className="dash-section-box-header">
          <div className="dash-box-title">
            <span className="dash-box-title-square">■</span>
            <span>RECENT LINKS</span>
          </div>

          {data?.recent_links?.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigate('links')}
              className="btn-table-action"
            >
              VIEW ALL LINKS →
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '30px' }}>
            <div className="dash-skeleton" style={{ height: '40px', marginBottom: '10px' }} />
            <div className="dash-skeleton" style={{ height: '40px', marginBottom: '10px' }} />
            <div className="dash-skeleton" style={{ height: '40px' }} />
          </div>
        ) : data?.recent_links?.length === 0 ? (
          <EmptyState
            title="NOTHING SHRUNK YET."
            message="Your first tiny URL is one click away."
            onAction={onOpenCreateModal}
            actionLabel="+ SHRNK URL →"
          />
        ) : (
          <div className="dash-table-wrapper">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>ORIGINAL</th>
                  <th>SHORT</th>
                  <th>CLICKS</th>
                  <th>CREATED</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {data?.recent_links?.map((link) => (
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
                      <span className={`dash-status-pill ${(link.status || (link.is_active ? 'ACTIVE' : 'EXPIRED')).toLowerCase()}`}>
                        {link.status || (link.is_active ? 'ACTIVE' : 'EXPIRED')}
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
                          title="View analytics"
                        >
                          <BarChart2 size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                          STATS
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default OverviewView;
