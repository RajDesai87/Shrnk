import React, { useState, useEffect, useRef } from 'react';
import { Menu, Plus, Search, ChevronDown, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Topbar({ title, onOpenCreateModal, onOpenMobileSidebar, onNavigate, onSearch, searchQuery = '' }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  // Dismiss dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="dash-topbar">
      {/* Left Title / Breadcrumb */}
      <div className="dash-topbar-left">
        <button
          type="button"
          className="mobile-dash-toggle"
          onClick={onOpenMobileSidebar}
          aria-label="Open sidebar navigation"
        >
          <Menu size={24} />
        </button>

        <h1 className="dash-page-title">{title}</h1>
      </div>

      {/* Right Search, Create Action & User Menu */}
      <div className="dash-topbar-right">
        {/* Search */}
        <div className="dash-search-box">
          <Search size={16} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="dash-search-input"
            aria-label="Search links"
          />
        </div>

        {/* Primary Action */}
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="btn-topbar-action"
          aria-label="Create shortened URL"
        >
          <Plus size={18} strokeWidth={3} />
          <span>SHRNK URL</span>
        </button>

        {/* User Menu Dropdown */}
        <div className="dash-user-dropdown-container" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="dash-user-dropdown-btn"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <span>{user?.name?.split(' ')[0] || 'Account'}</span>
            <ChevronDown size={14} strokeWidth={2.5} />
          </button>

          {dropdownOpen && (
            <div className="dash-dropdown-menu" role="menu">
              <div className="dash-dropdown-header">
                <div className="dash-dropdown-user-name">{user?.name}</div>
                <div className="dash-dropdown-user-email">{user?.email}</div>
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={() => { setDropdownOpen(false); onNavigate('overview'); }}
                className="dash-dropdown-item"
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => { setDropdownOpen(false); onNavigate('settings'); }}
                className="dash-dropdown-item"
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => { setDropdownOpen(false); logout(); }}
                className="dash-dropdown-item danger"
              >
                <LogOut size={16} />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
