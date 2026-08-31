import React, { useState } from 'react';

export function Hero({ onOpenAuth, inputRef }) {
  const [inputUrl, setInputUrl] = useState('');

  const handleShorten = (e) => {
    e.preventDefault();
    if (onOpenAuth) {
      onOpenAuth('signup', inputUrl.trim());
    }
  };

  return (
    <section id="shortener-form" className="hero-section">
      <div className="hero-grid-bg" aria-hidden="true" />
      
      <div className="hero-content">
        {/* Version Tag */}
        <div className="hero-tag">
          <span>URL SHORTENER · V1.0</span>
        </div>

        {/* Main Display Headline */}
        <h1 className="hero-title">
          SHRINK THE<br />
          INTERNET<span className="hero-dot">.</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          Turn ridiculously long URLs into tiny, shareable links.
        </p>

        {/* Shortener Form */}
        <form onSubmit={handleShorten} className="shortener-form-container">
          <div className="form-label-row">
            <span className="form-label">LONG URL</span>
          </div>

          <div className="form-input-group">
            <input
              ref={inputRef}
              type="text"
              className="shortener-input"
              placeholder="https://example.com/your/very/long/url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              spellCheck="false"
              autoComplete="off"
            />
            <button
              type="submit"
              className="btn-shorten"
              aria-label="Shrink URL"
            >
              <span>SHRNK</span>
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </form>
      </div>

      {/* Metrics Banner Section */}
      <div className="hero-stats-banner">
        <div className="stats-banner-inner">
          <div className="stats-caption">
            DEMO VALUES — NOT PRODUCTION METRICS
          </div>

          <div className="stats-cards-grid">
            {/* Stat 1 */}
            <div className="stat-card">
              <div className="stat-label">LINKS READY TO SHRINK</div>
              <div className="stat-value">10M+</div>
            </div>

            {/* Stat 2 */}
            <div className="stat-card">
              <div className="stat-label">REDIRECT UPTIME TARGET</div>
              <div className="stat-value">99.9%</div>
            </div>

            {/* Stat 3 */}
            <div className="stat-card">
              <div className="stat-label">TARGET REDIRECT LATENCY</div>
              <div className="stat-value">&lt;100ms</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
