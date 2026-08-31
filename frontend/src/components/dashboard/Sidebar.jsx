import React from 'react';
import { LogoMark } from '../Logo';
import { LayoutDashboard, Link2, BarChart3, Settings, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Sidebar({ currentTab, onNavigate, isOpen, onClose }) {
  const { user, logout } = useAuth();

  const navItemsMain = [
    { id: 'overview', label: 'OVERVIEW', icon: LayoutDashboard },
    { id: 'links', label: 'LINKS', icon: Link2 },
    { id: 'analytics', label: 'ANALYTICS', icon: BarChart3 },
  ];

  const navItemsAccount = [
    { id: 'settings', label: 'SETTINGS', icon: Settings },
  ];

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const handleNav = (tabId) => {
    onNavigate(tabId);
    if (onClose) onClose();
  };

  return (
    <aside className={`dash-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Top Brand Header */}
      <div>
        <div className="dash-sidebar-header">
          <div 
            className="dash-sidebar-brand" 
            onClick={() => handleNav('overview')}
          >
            <LogoMark size={26} />
            <span className="dash-brand-name">SHRNK</span>
          </div>

          {/* Close button for mobile drawer */}
          <button 
            type="button" 
            className="btn-modal-close mobile-dash-toggle" 
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="dash-nav-section">
          <span className="dash-nav-label">MAIN</span>
          {navItemsMain.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`dash-nav-item ${isActive ? 'active' : ''}`}
              >
                {isActive ? <span className="dash-active-dot">●</span> : <Icon size={18} strokeWidth={2.2} />}
                <span>{item.label}</span>
              </button>
            );
          })}

          <div style={{ height: '12px' }} />

          <span className="dash-nav-label">ACCOUNT</span>
          {navItemsAccount.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`dash-nav-item ${isActive ? 'active' : ''}`}
              >
                {isActive ? <span className="dash-active-dot">●</span> : <Icon size={18} strokeWidth={2.2} />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom User Card */}
      <div className="dash-sidebar-footer">
        <div className="dash-user-card">
          <div className="dash-user-info-row">
            <div className="dash-user-avatar">{userInitial}</div>
            <div className="dash-user-meta">
              <span className="dash-user-name" title={user?.name || 'User'}>
                {user?.name || 'User'}
              </span>
              <span className="dash-user-email" title={user?.email || ''}>
                {user?.email || ''}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="btn-sidebar-logout"
            title="Log out of SHRNK"
            aria-label="Log out"
          >
            <LogOut size={18} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
