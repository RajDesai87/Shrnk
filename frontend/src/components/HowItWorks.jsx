import React, { useState } from 'react';
import { getShortUrlDisplay, getFullShortUrl } from '../config';

const sampleCode = 'a7Kx92';

const stepsData = [
  {
    step: '01',
    title: 'Paste',
    description: 'Paste your long URL.',
  },
  {
    step: '02',
    title: 'SHRNK',
    description: 'SHRNK generates a unique short code.',
  },
  {
    step: '03',
    title: 'Share',
    description: 'Share your short URL anywhere.',
  },
];

export function HowItWorks() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullShortUrl(sampleCode));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="section-container">
        {/* Section Heading */}
        <div className="section-header">
          <h2 className="section-title">
            HOW SHRNK WORKS
          </h2>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="steps-grid">
          {stepsData.map((item) => (
            <div key={item.step} className="step-card">
              <div className="step-badge">
                {item.step}
              </div>
              <h3 className="step-title">{item.title}</h3>
              <p className="step-desc">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Transformation Visualizer Box */}
        <div className="transformation-container">
          <div className="transformation-label">
            TRANSFORMATION
          </div>

          <div className="transformation-box">
            <div className="transformation-input-side">
              <span className="transformation-long-url">
                https://example.com/really/long/url
              </span>
            </div>

            <div className="transformation-arrow" aria-hidden="true">
              →
            </div>

            <div 
              className="transformation-output-side" 
              onClick={handleCopy} 
              title="Click to copy"
            >
              <span className="transformation-short-pill">
                {copied ? 'COPIED!' : getShortUrlDisplay(sampleCode)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
