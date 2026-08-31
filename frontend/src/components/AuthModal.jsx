import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { LogoMark } from './Logo';
import { useAuth } from '../context/AuthContext';
import LegalModal from './LegalModal';

export function AuthModal({ isOpen, onClose, initialMode = 'signup', urlToShorten = '', onAuthSuccess }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'signup' | 'login' | 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [legalModalType, setLegalModalType] = useState(null); // 'terms' | 'privacy' | null

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setAuthError('');
      setPassword('');
      setShowPassword(false);
      setForgotSubmitted(false);
      setLegalModalType(null);
    }
  }, [initialMode, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (legalModalType) {
          setLegalModalType(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, legalModalType]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    const trimmedEmail = email.trim().toLowerCase();

    // Mode: Forgot Password
    if (mode === 'forgot') {
      if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
        setAuthError('Please enter a valid email address.');
        return;
      }
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        setForgotSubmitted(true);
      }, 600);
      return;
    }

    // Validation for Login / Signup
    if (mode === 'signup' && !name.trim()) {
      setAuthError('Please enter your name.');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setAuthError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await register(name.trim(), trimmedEmail, password);
      } else {
        await login(trimmedEmail, password);
      }

      onClose();
      if (onAuthSuccess) {
        onAuthSuccess(urlToShorten);
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    setAuthError('Google login is temporarily unavailable. Please use email & password.');
  };

  const handleGithubLogin = () => {
    setAuthError('GitHub login is temporarily unavailable. Please use email & password.');
  };

  return (
    <>
      <div className="auth-modal-overlay">
        <div 
          className="auth-modal-box" 
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          {/* Modal Top Header */}
          <div className="auth-modal-header">
            <div className="auth-modal-brand">
              <LogoMark size={24} />
              <span id="auth-modal-title" className="auth-modal-title">SHRNK ACCESS</span>
            </div>
            <button 
              type="button" 
              className="btn-close-modal" 
              onClick={onClose}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="auth-modal-body">
            {/* Mode Switcher Tabs (Hidden in forgot password mode) */}
            {mode !== 'forgot' ? (
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
            ) : (
              <div style={{ marginBottom: '16px' }}>
                <button
                  type="button"
                  className="auth-forgot-link"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                  onClick={() => { setMode('login'); setAuthError(''); setForgotSubmitted(false); }}
                >
                  <ArrowLeft size={14} />
                  <span>Back to log in</span>
                </button>
              </div>
            )}

            {/* Subtitle */}
            <p className="auth-subtitle">
              {mode === 'signup' 
                ? (urlToShorten ? `Sign up to save & track your custom short URL.` : `Create your free SHRNK account in seconds.`)
                : mode === 'login'
                ? `Welcome back. Your links are waiting.`
                : `RESET YOUR PASSWORD. Enter your email and we'll send instructions.`}
            </p>

            {/* Error Banner */}
            {authError && (
              <div className="auth-error-banner" role="alert">
                {authError}
              </div>
            )}

            {/* Forgot Password Flow */}
            {mode === 'forgot' ? (
              <div>
                {forgotSubmitted ? (
                  <div style={{
                    backgroundColor: '#FAF8F5',
                    border: '2px solid #0D0D0D',
                    boxShadow: '2px 2px 0px #0D0D0D',
                    padding: '20px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontWeight: 900, fontSize: '0.95rem', marginBottom: '8px' }}>
                      CHECK YOUR INBOX
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '18px' }}>
                      If an account exists for <strong>{email}</strong>, you will receive password reset instructions.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setForgotSubmitted(false); }}
                      className="btn-auth-submit"
                      style={{ width: '100%' }}
                    >
                      <span>RETURN TO LOG IN</span>
                      <span className="btn-arrow">→</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-form-group">
                      <label htmlFor="auth-forgot-email" className="auth-label">EMAIL ADDRESS</label>
                      <input
                        id="auth-forgot-email"
                        type="email"
                        required
                        className="auth-input"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        autoFocus
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-auth-submit"
                      disabled={submitting}
                    >
                      <span>{submitting ? 'SENDING...' : 'SEND RESET LINK'}</span>
                      <span className="btn-arrow">→</span>
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <>
                {/* Social OAuth Buttons: Google & GitHub */}
                <div className="auth-social-buttons">
                  <button 
                    type="button" 
                    className="btn-social-auth" 
                    onClick={handleGoogleLogin}
                    aria-label="Continue with Google"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <button 
                    type="button" 
                    className="btn-social-auth" 
                    onClick={handleGithubLogin}
                    aria-label="Continue with GitHub"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                      <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
                    <span>Continue with GitHub</span>
                  </button>
                </div>

                <div className="auth-divider">
                  <span>OR WITH EMAIL</span>
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                  {/* Name field in signup */}
                  {mode === 'signup' && (
                    <div className="auth-form-group">
                      <label htmlFor="auth-name" className="auth-label">NAME</label>
                      <input
                        id="auth-name"
                        type="text"
                        required
                        className="auth-input"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        autoFocus
                      />
                    </div>
                  )}

                  {/* Email address field */}
                  <div className="auth-form-group">
                    <label htmlFor="auth-email" className="auth-label">EMAIL ADDRESS</label>
                    <input
                      id="auth-email"
                      type="email"
                      required
                      className="auth-input"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      autoFocus={mode === 'login'}
                    />
                  </div>

                  {/* Password field with toggle & forgot link */}
                  <div className="auth-form-group">
                    <div className="auth-label-row">
                      <label htmlFor="auth-password" className="auth-label">PASSWORD</label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => { setMode('forgot'); setAuthError(''); }}
                          className="auth-forgot-link"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>

                    <div className="auth-password-wrapper">
                      <input
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="auth-input"
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="btn-password-toggle"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Password requirement helper on signup */}
                    {mode === 'signup' && (
                      <div className={`auth-password-hint ${password.length >= 8 ? 'valid' : ''}`}>
                        {password.length >= 8 ? 'At least 8 characters ✓' : 'At least 8 characters'}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn-auth-submit"
                    disabled={submitting}
                  >
                    <span>
                      {submitting
                        ? (mode === 'signup' ? 'CREATING ACCOUNT...' : 'LOGGING IN...')
                        : (mode === 'signup' ? 'CREATE FREE ACCOUNT' : 'LOG IN TO SHRNK')}
                    </span>
                    <span className="btn-arrow">→</span>
                  </button>
                </form>
              </>
            )}

            {/* Footer note for ALL modes */}
            <div className="auth-modal-footer-note">
              <span>
                By proceeding, you agree to SHRNK's{' '}
                <button
                  type="button"
                  onClick={() => setLegalModalType('terms')}
                  className="auth-legal-link"
                >
                  Terms
                </button>
                {' '}&{' '}
                <button
                  type="button"
                  onClick={() => setLegalModalType('privacy')}
                  className="auth-legal-link"
                >
                  Privacy Policy
                </button>
                .
              </span>
            </div>
          </div>
        </div>
      </div>
      {legalModalType && (
        <LegalModal 
          isOpen={Boolean(legalModalType)} 
          type={legalModalType} 
          onClose={() => setLegalModalType(null)} 
        />
      )}
    </>
  );
}

export default AuthModal;
