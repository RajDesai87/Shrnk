import React, { useEffect } from 'react';
import { X, ShieldCheck, FileText, Check } from 'lucide-react';
import { LogoMark } from './Logo';

export function LegalModal({ isOpen = true, type = 'terms', onClose }) {
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

  const isPrivacy = type === 'privacy';
  const title = isPrivacy ? 'PRIVACY POLICY' : 'TERMS OF SERVICE';
  const lastUpdated = 'August 31, 2026';

  return (
    <div className="auth-modal-overlay" style={{ zIndex: 3000 }} onClick={onClose}>
      <div 
        className="auth-modal-box"
        style={{ 
          maxWidth: '560px', 
          maxHeight: '85vh', 
          display: 'flex', 
          flexDirection: 'column' 
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
      >
        {/* Header */}
        <div className="auth-modal-header" style={{ flexShrink: 0 }}>
          <div className="auth-modal-brand">
            <LogoMark size={22} />
            <span id="legal-modal-title" className="auth-modal-title">
              {title}
            </span>
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

        {/* Scrollable Content */}
        <div 
          style={{ 
            padding: '24px', 
            overflowY: 'auto', 
            fontSize: '0.88rem', 
            lineHeight: 1.6,
            color: 'var(--dash-black)' 
          }}
        >
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            backgroundColor: 'var(--dash-lime)', 
            border: '2px solid #0D0D0D',
            padding: '4px 10px', 
            fontWeight: 800, 
            fontSize: '0.72rem', 
            marginBottom: '16px' 
          }}>
            {isPrivacy ? <ShieldCheck size={14} /> : <FileText size={14} />}
            <span>LAST UPDATED: {lastUpdated}</span>
          </div>

          {isPrivacy ? (
            <div>
              <p style={{ fontWeight: 700, marginBottom: '14px' }}>
                SHRNK is a developer-focused URL shortener and analytics tool. This policy explains what information is collected, stored, and processed when you use our service.
              </p>

              <h4 style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '16px', marginBottom: '6px', textTransform: 'uppercase' }}>
                1. Account Information
              </h4>
              <p style={{ color: '#444444', marginBottom: '12px' }}>
                When you create an account, we store your full name, normalized lowercase email address, and account creation timestamp. Passwords are cryptographically salted and hashed using <strong>bcrypt (12 rounds)</strong>. We <strong>never</strong> store, view, or log plaintext passwords.
              </p>

              <h4 style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '16px', marginBottom: '6px', textTransform: 'uppercase' }}>
                2. URL & Link Records
              </h4>
              <p style={{ color: '#444444', marginBottom: '12px' }}>
                When shortening URLs, we store the original destination URL, generated short code / custom alias, creation timestamp, active status, and optional expiration date. Canonical short URLs are dynamically constructed at runtime from environment configuration and are never hardcoded in the database.
              </p>

              <h4 style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '16px', marginBottom: '6px', textTransform: 'uppercase' }}>
                3. Click & Analytics Data
              </h4>
              <p style={{ color: '#444444', marginBottom: '12px' }}>
                When a visitor accesses a shortened link, we record anonymous routing telemetry: click timestamp, client IP address, User-Agent header (parsed into Desktop vs Mobile device distribution), and HTTP Referrer header (traffic source). This data is aggregated strictly for link owner analytics.
              </p>

              <h4 style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '16px', marginBottom: '6px', textTransform: 'uppercase' }}>
                4. Data Protection & Sharing
              </h4>
              <p style={{ color: '#444444', marginBottom: '12px' }}>
                We do not sell, monetize, or rent user data. Your URLs, analytics, and credentials belong to your account. Account deletion permanently purges all owned URLs and associated click history from the database.
              </p>

              <h4 style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '16px', marginBottom: '6px', textTransform: 'uppercase' }}>
                5. Third-Party Integrations
              </h4>
              <p style={{ color: '#444444', marginBottom: '12px' }}>
                If social authentication (e.g. Google OAuth) is utilized, only standard profile verification tokens and email addresses are exchanged to authenticate your session.
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontWeight: 700, marginBottom: '14px' }}>
                Welcome to SHRNK. By creating an account or shortening URLs, you agree to these Terms of Service.
              </p>

              <h4 style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '16px', marginBottom: '6px', textTransform: 'uppercase' }}>
                1. Service Overview
              </h4>
              <p style={{ color: '#444444', marginBottom: '12px' }}>
                SHRNK provides URL shortening, redirection, expiration timers, and aggregated click analytics for personal and commercial usage under fair-use principles.
              </p>

              <h4 style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '16px', marginBottom: '6px', textTransform: 'uppercase' }}>
                2. Acceptable Use & Prohibited Content
              </h4>
              <p style={{ color: '#444444', marginBottom: '12px' }}>
                You agree not to use SHRNK to shorten links that lead to malware, phishing schemes, ransomware, unauthorized credential harvesting, illegal spam, defamatory material, or abusive content. Links violating these terms are subject to immediate deactivation.
              </p>

              <h4 style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '16px', marginBottom: '6px', textTransform: 'uppercase' }}>
                3. User Responsibility
              </h4>
              <p style={{ color: '#444444', marginBottom: '12px' }}>
                You are solely responsible for all content, websites, and destinations linked through your account. You agree to maintain the security of your login credentials.
              </p>

              <h4 style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '16px', marginBottom: '6px', textTransform: 'uppercase' }}>
                4. Custom Aliases & Link Expiration
              </h4>
              <p style={{ color: '#444444', marginBottom: '12px' }}>
                Custom aliases are reserved exclusively to your account as long as the link record exists. Expired links stop redirecting and return a 410 Gone notice while preserving historical analytics. Deleting a link permanently removes its analytics and releases the alias.
              </p>

              <h4 style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '16px', marginBottom: '6px', textTransform: 'uppercase' }}>
                5. Service Availability & Termination
              </h4>
              <p style={{ color: '#444444', marginBottom: '12px' }}>
                SHRNK is provided on an "as-is" and "as-available" basis. We reserve the right to suspend or terminate accounts that engage in system abuse, excessive automated scraping, or denial-of-service attempts.
              </p>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div style={{ 
          padding: '16px 24px', 
          borderTop: '2px solid #0D0D0D', 
          backgroundColor: '#FAF8F5', 
          display: 'flex', 
          justifyContent: 'flex-end',
          flexShrink: 0
        }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-dash-save"
            style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Check size={16} strokeWidth={3} />
            <span>I UNDERSTAND</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LegalModal;
