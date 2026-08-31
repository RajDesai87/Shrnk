import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { LogoMark } from './Logo';

// Crisp SVG Icons for Social Links
function GitHubIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedInIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function MailIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export function Footer() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer-wrapper">
      <div className="footer-container">
        {/* Left Side: Brand & Creator Info */}
        <div className="footer-brand-side">
          <div className="footer-brand-header">
            <LogoMark size={26} />
            <h3 className="footer-logo-title">SHRNK</h3>
          </div>

          <p className="footer-tagline">SHRINK THE INTERNET.</p>

          <p className="footer-bio">
            Minimalist, lightning-fast URL shortener with real-time analytics and neo-brutalist aesthetics.
          </p>

          <div className="footer-creator-card">
            <div className="creator-text">
              Crafted by <strong>Raj Desai</strong> © 2026
            </div>
            <div className="last-updated-badge">
              <span className="live-dot" />
              <span>Last updated: August 2026</span>
            </div>
          </div>
        </div>

        {/* Middle Side: Connect & Socials */}
        <div className="footer-middle-side">
          <span className="footer-col-title">CONNECT WITH CREATOR</span>
          <div className="footer-social-buttons">
            <a 
              href="https://github.com/RajDesai87" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-btn"
              title="GitHub Profile"
            >
              <GitHubIcon size={16} />
              <span>RajDesai87</span>
              <ArrowUpRight size={14} className="social-arrow" />
            </a>

            <a 
              href="https://www.linkedin.com/in/raj-desai132/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-btn"
              title="LinkedIn Profile"
            >
              <LinkedInIcon size={16} />
              <span>raj-desai132</span>
              <ArrowUpRight size={14} className="social-arrow" />
            </a>

            <a 
              href="mailto:rajgpdesai2007@gmail.com" 
              className="social-btn"
              title="Send Email"
            >
              <MailIcon size={16} />
              <span>rajgpdesai2007@gmail.com</span>
              <ArrowUpRight size={14} className="social-arrow" />
            </a>
          </div>
        </div>

        {/* Right Side: Links Columns */}
        <div className="footer-links-side">
          {/* Column 1: Product */}
          <div className="footer-column">
            <span className="footer-col-title">PRODUCT</span>
            <ul className="footer-link-list">
              <li>
                <button type="button" onClick={() => scrollToSection('features')} className="footer-link">
                  Features
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('how-it-works')} className="footer-link">
                  How It Works
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('analytics')} className="footer-link">
                  Analytics
                </button>
              </li>
              <li>
                <a 
                  href="https://github.com/RajDesai87/Shrnk" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="footer-link font-semibold"
                >
                  GitHub Repository ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Legal */}
          <div className="footer-column">
            <span className="footer-col-title">LEGAL</span>
            <ul className="footer-link-list">
              <li>
                <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('SHRNK respects your privacy. No personal tracking data is stored without consent.'); }} className="footer-link">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Terms of Service: Free for personal and commercial use under fair usage policy.'); }} className="footer-link">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="https://github.com/RajDesai87/Shrnk/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="footer-link">
                  MIT License
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div className="footer-sub-bar">
        <div className="footer-sub-content">
          <span>SHRNK · OPEN-SOURCE URL SHORTENER</span>
          <span>BUILT WITH REACT + CSS</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
