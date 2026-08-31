import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import OverviewView from './OverviewView';
import LinksView from './LinksView';
import AnalyticsView from './AnalyticsView';
import SettingsView from './SettingsView';
import CreateUrlModal from './CreateUrlModal';
import LinkAnalyticsModal from './LinkAnalyticsModal';
import './Dashboard.css';

export function DashboardLayout({ activeTab = 'overview', onNavigateTab, initialCreateUrl = '' }) {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(!!initialCreateUrl);
  const [createInitialUrl, setCreateInitialUrl] = useState(initialCreateUrl);
  const [analyticsModalUrlId, setAnalyticsModalUrlId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (activeTab && activeTab !== currentTab) {
      setCurrentTab(activeTab);
    }
  }, [activeTab, currentTab]);

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    setSearchQuery('');
    if (onNavigateTab) {
      onNavigateTab(tab);
    }
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'links':
        return 'YOUR LINKS';
      case 'analytics':
        return 'LINK ANALYTICS';
      case 'settings':
        return 'SETTINGS';
      case 'overview':
      default:
        return 'DASHBOARD';
    }
  };

  const handleOpenCreateModal = (url = '') => {
    setCreateInitialUrl(typeof url === 'string' ? url : '');
    setCreateModalOpen(true);
  };

  const handleOpenAnalytics = (urlId) => {
    setAnalyticsModalUrlId(urlId);
  };

  const handleUrlCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSearch = (q) => {
    setSearchQuery(q);
    if (currentTab !== 'links' && q) {
      handleTabChange('links');
    }
  };

  return (
    <div className="dashboard-root">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onNavigate={handleTabChange}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="dash-main-area">
        <Topbar
          title={getPageTitle()}
          onOpenCreateModal={() => handleOpenCreateModal()}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onNavigate={handleTabChange}
          onSearch={handleSearch}
          searchQuery={searchQuery}
        />

        <main className="dash-content-body" key={refreshTrigger}>
          {currentTab === 'overview' && (
            <OverviewView
              onOpenCreateModal={() => handleOpenCreateModal()}
              onOpenAnalyticsModal={handleOpenAnalytics}
              onNavigate={handleTabChange}
            />
          )}

          {currentTab === 'links' && (
            <LinksView
              onOpenCreateModal={() => handleOpenCreateModal()}
              onOpenAnalyticsModal={handleOpenAnalytics}
              externalSearch={searchQuery}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              onOpenAnalyticsModal={handleOpenAnalytics}
              onOpenCreateModal={() => handleOpenCreateModal()}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Create URL Modal */}
      <CreateUrlModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleUrlCreated}
        initialUrl={createInitialUrl}
      />

      {/* Single Link Analytics Modal */}
      <LinkAnalyticsModal
        isOpen={!!analyticsModalUrlId}
        urlId={analyticsModalUrlId}
        onClose={() => setAnalyticsModalUrlId(null)}
      />
    </div>
  );
}

export default DashboardLayout;
