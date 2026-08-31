import React, { useState, useRef, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import DashboardPreview from './components/DashboardPreview';
import AnalyticsPreview from './components/AnalyticsPreview';
import CTA from './components/CTA';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import { ArrowUp } from 'lucide-react';
import './App.css';

function App() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: 'signup',
    urlToShorten: ''
  });
  const inputRef = useRef(null);

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

  const handleOpenAuth = (mode = 'signup', url = '') => {
    setAuthModal({
      isOpen: true,
      mode,
      urlToShorten: url
    });
  };

  const handleCloseAuth = () => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="app-container">
      {/* Fixed Header Navbar */}
      <Navbar 
        onGetStartedClick={() => handleOpenAuth('signup')} 
        onLoginClick={() => handleOpenAuth('login')}
      />

      {/* Main Content Sections */}
      <main className="main-content">
        <Hero 
          onOpenAuth={handleOpenAuth} 
          inputRef={inputRef} 
        />
        
        <Features />
        
        <HowItWorks />
        
        <DashboardPreview />
        
        <AnalyticsPreview />
        
        <CTA onStartClick={() => handleOpenAuth('signup')} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Fixed Upward Arrow Button to scroll to top */}
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
        isOpen={authModal.isOpen}
        onClose={handleCloseAuth}
        initialMode={authModal.mode}
        urlToShorten={authModal.urlToShorten}
      />
    </div>
  );
}

export default App;
