import React from 'react';

export function StatCard({ label, value, icon: Icon, loading }) {
  if (loading) {
    return (
      <div className="dash-stat-card dash-skeleton">
        <div style={{ height: '14px', width: '60%', backgroundColor: '#DDD', marginBottom: '16px' }} />
        <div style={{ height: '36px', width: '40%', backgroundColor: '#DDD' }} />
      </div>
    );
  }

  return (
    <div className="dash-stat-card">
      <div className="dash-stat-header">
        <span className="dash-stat-label">{label}</span>
        {Icon && <Icon size={18} strokeWidth={2.2} />}
      </div>
      <div className="dash-stat-value">{value}</div>
    </div>
  );
}

export default StatCard;
