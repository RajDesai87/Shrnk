import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { LogoMark } from './Logo';

export function AuthModal({ isOpen, onClose, initialMode = 'signup', urlToShorten = '' }) {
  const [mode, setMode] = useState(initialMode); // 'signup' or 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setAuthError('');
  }, [initialMode, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  const handleGoogleLogin = () => {
    // Frontend-only notification banner as requested
    setAuthError('Google Services are temporarily unavailable');
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div 
        className="auth-modal-box" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Header */}
        <div className="auth-modal-header">
          <div className="auth-modal-brand">
            <LogoMark size={24} />
            <span className="auth-modal-title">SHRNK ACCESS</span>
          </div>
          <button 
            type="button" 
            className="btn-close-modal" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="auth-modal-body">
          {/* Mode Switcher Tabs */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => { setMode('signup'); setAuthError(''); }}
            >
              GET STARTED
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setAuthError(''); }}
            >
              LOG IN
            </button>
          </div>

          <p className="auth-subtitle">
            {mode === 'signup' 
              ? (urlToShorten ? `Sign up to save & track your custom short URL.` : `Create your free SHRNK account in seconds.`)
              : `Welcome back. Access your links and real-time analytics.`}
          </p>

          {/* Error Banner matching user screenshot */}
          {authError && (
            <div className="auth-error-banner">
              {authError}
            </div>
          )}

          {/* Social Google Login Button */}
          <div className="auth-social-buttons">
            <button 
              type="button" 
              className="btn-social-auth" 
              onClick={handleGoogleLogin}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="auth-divider">
            <span>OR WITH EMAIL</span>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-group">
              <label className="auth-label">EMAIL ADDRESS</label>
              <input
                type="email"
                required
                className="auth-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label">PASSWORD</label>
              <input
                type="password"
                required
                className="auth-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={submitted}
            >
              <span>{submitted ? 'CONNECTING...' : (mode === 'signup' ? 'CREATE FREE ACCOUNT' : 'LOG IN TO SHRNK')}</span>
              <span className="btn-arrow">→</span>
            </button>
          </form>

          {/* Footer note */}
          <div className="auth-modal-footer-note">
            <span>By proceeding, you agree to SHRNK's Terms & Privacy Policy.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
