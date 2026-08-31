import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import DashboardPreview from './components/DashboardPreview';
import AnalyticsPreview from './components/AnalyticsPreview';
import CTA from './components/CTA';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import DashboardLayout from './components/dashboard/DashboardLayout';
import LoadingScreen from './components/LoadingScreen';
import { ArrowUp } from 'lucide-react';
import './App.css';

function getNormalizedPath() {
  const path = window.location.pathname || '/';
  if (path === '/' && window.location.hash) {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash) return '/' + hash;
  }
  return path;
}

function MainApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState(getNormalizedPath);
  const [initialCreateUrl, setInitialCreateUrl] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const inputRef = useRef(null);

  // Centralized Navigation helper
  const navigate = useCallback((toPath, { replace = false } = {}) => {
    if (replace) {
      window.history.replaceState(null, '', toPath);
    } else {
      window.history.pushState(null, '', toPath);
    }
    setCurrentPath(toPath);
  }, []);

  // Listen to browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getNormalizedPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Route Guards
  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      // Authenticated users should never see guest routes (/, /login, /signup, /forgot-password)
      if (['/', '/login', '/signup', '/forgot-password'].includes(currentPath)) {
        navigate('/dashboard', { replace: true });
      }
    } else {
      // Unauthenticated users attempting to access /dashboard/* are redirected to /login
      if (currentPath.startsWith('/dashboard')) {
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, currentPath, navigate]);

  // Handle scroll to top arrow on landing page
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 240) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthSuccess = (urlToShorten = '') => {
    if (urlToShorten) {
      setInitialCreateUrl(urlToShorten);
    }
    navigate('/dashboard');
  };

  const handleOpenAuth = (mode = 'signup', url = '') => {
    if (url) {
      setInitialCreateUrl(url);
    }
    navigate(mode === 'login' ? '/login' : '/signup');
  };

  const handleCloseAuth = () => {
    navigate('/', { replace: true });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // 1. Initial Loading Splash: prevents visual flashes of incorrect routes
  if (isLoading) {
    return <LoadingScreen message="AUTHENTICATING..." />;
  }

  // 2. Authenticated Dashboard View
  if (isAuthenticated && currentPath.startsWith('/dashboard')) {
    const subRoute = currentPath.replace(/^\/dashboard\/?/, '');
    const activeTab = ['links', 'analytics', 'settings'].includes(subRoute) ? subRoute : 'overview';

    return (
      <DashboardLayout
        activeTab={activeTab}
        onNavigateTab={(tab) => navigate(tab === 'overview' ? '/dashboard' : `/dashboard/${tab}`)}
        initialCreateUrl={initialCreateUrl}
      />
    );
  }

  // 3. Guest / Landing View with Modal States
  const isAuthModalOpen = ['/login', '/signup', '/forgot-password'].includes(currentPath);
  const authModalMode = currentPath === '/login' ? 'login' : currentPath === '/forgot-password' ? 'forgot' : 'signup';

  return (
    <div className="app-container">
      {/* Fixed Header Navbar */}
      <Navbar 
        onGetStartedClick={() => handleOpenAuth('signup')} 
        onLoginClick={() => handleOpenAuth('login')}
        onNavigateDashboard={() => navigate('/dashboard')}
      />

      {/* Main Content Sections */}
      <main className="main-content">
        <Hero 
          onOpenAuth={handleOpenAuth} 
          onNavigateDashboard={(tab, url) => {
            if (url) setInitialCreateUrl(url);
            navigate(tab === 'overview' ? '/dashboard' : `/dashboard/${tab}`);
          }}
          inputRef={inputRef} 
        />
        
        <Features />
        
        <HowItWorks />
        
        <DashboardPreview />
        
        <AnalyticsPreview />
        
        <CTA 
          onStartClick={() => handleOpenAuth('signup')} 
          onNavigateDashboard={() => navigate('/dashboard')}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll Top Arrow Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="btn-scroll-top"
          aria-label="Scroll to top"
          title="Back to top"
        >
          <ArrowUp size={22} strokeWidth={2.5} />
        </button>
      )}

      {/* Auth / Signup / Login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuth}
        initialMode={authModalMode}
        urlToShorten={initialCreateUrl}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
