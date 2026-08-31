import React from 'react';
import { useAuth } from '../context/AuthContext';

export function CTA({ onStartClick, onNavigateDashboard }) {
  const { isAuthenticated } = useAuth();

  const handleAction = () => {
    if (isAuthenticated) {
      if (onNavigateDashboard) {
        onNavigateDashboard('overview');
      }
    } else if (onStartClick) {
      onStartClick();
    } else {
      const heroInput = document.querySelector('.shortener-input');
      if (heroInput) {
        heroInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => heroInput.focus(), 400);
      }
    }
  };

  return (
    <section className="cta-section">
      <div className="section-container">
        <div className="cta-banner-box">
          <h2 className="cta-title">
            READY TO MAKE IT SMALL?
          </h2>
          
          <p className="cta-subtitle">
            Create your first SHRNK link in seconds.
          </p>

          <button
            type="button"
            onClick={handleAction}
            className="btn-cta-action"
          >
            <span>{isAuthenticated ? 'GO TO DASHBOARD' : 'START SHRINKING'}</span>
            <span className="cta-arrow">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default CTA;
