import React, { useState } from 'react';
import { LogoMark } from './Logo';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Navbar({ onGetStartedClick, onLoginClick, onNavigateDashboard }) {
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToTop = () => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="navbar-wrapper">
      <nav className="navbar-container">
        {/* Brand / Logo */}
        <a 
          href="#top" 
          className="navbar-brand" 
          onClick={(e) => { 
            e.preventDefault(); 
            scrollToTop(); 
          }}
        >
          <LogoMark size={28} />
          <span className="brand-name">SHRNK</span>
        </a>

        {/* Desktop Navigation Links */}
        <div className="navbar-links">
          <button type="button" onClick={scrollToTop} className="nav-link">
            HOME
          </button>
          <button type="button" onClick={() => scrollToSection('features')} className="nav-link">
            FEATURES
          </button>
          <button type="button" onClick={() => scrollToSection('how-it-works')} className="nav-link">
            HOW IT WORKS
          </button>
          <button type="button" onClick={() => scrollToSection('analytics')} className="nav-link">
            ANALYTICS
          </button>
        </div>

        {/* Action Buttons */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <button 
                type="button" 
                onClick={onNavigateDashboard} 
                className="btn-get-started"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LayoutDashboard size={16} strokeWidth={2.5} />
                <span>DASHBOARD</span>
              </button>
              <button 
                type="button" 
                onClick={logout} 
                className="btn-nav-login"
                title="Log out"
              >
                LOG OUT
              </button>
            </>
          ) : (
            <>
              <button 
                type="button" 
                onClick={onLoginClick} 
                className="btn-nav-login"
              >
                LOGIN
              </button>
              <button 
                type="button" 
                onClick={onGetStartedClick} 
                className="btn-get-started"
              >
                GET STARTED
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          type="button" 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-nav-menu">
          <button type="button" onClick={scrollToTop} className="mobile-nav-link">
            HOME
          </button>
          <button type="button" onClick={() => scrollToSection('features')} className="mobile-nav-link">
            FEATURES
          </button>
          <button type="button" onClick={() => scrollToSection('how-it-works')} className="mobile-nav-link">
            HOW IT WORKS
          </button>
          <button type="button" onClick={() => scrollToSection('analytics')} className="mobile-nav-link">
            ANALYTICS
          </button>
          <hr className="mobile-nav-divider" />
          <div className="mobile-nav-actions">
            {isAuthenticated ? (
              <>
                <button 
                  type="button" 
                  onClick={() => { setMobileMenuOpen(false); onNavigateDashboard(); }} 
                  className="btn-get-started w-full"
                >
                  DASHBOARD
                </button>
                <button 
                  type="button" 
                  onClick={() => { setMobileMenuOpen(false); logout(); }} 
                  className="btn-nav-login w-full text-center"
                >
                  LOG OUT
                </button>
              </>
            ) : (
              <>
                <button 
                  type="button" 
                  onClick={() => { setMobileMenuOpen(false); onLoginClick(); }} 
                  className="btn-nav-login w-full text-center"
                >
                  LOGIN
                </button>
                <button 
                  type="button" 
                  onClick={() => { 
                    setMobileMenuOpen(false); 
                    onGetStartedClick(); 
                  }} 
                  className="btn-get-started w-full"
                >
                  GET STARTED
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
