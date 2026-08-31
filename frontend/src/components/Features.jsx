import React from 'react';
import { Zap, BarChart2, Edit3, Timer } from 'lucide-react';

const featuresData = [
  {
    id: '01',
    title: 'FAST',
    description: 'Short URLs generated quickly.',
    icon: Zap,
  },
  {
    id: '02',
    title: 'TRACKABLE',
    description: 'Understand how your links are being used.',
    icon: BarChart2,
  },
  {
    id: '03',
    title: 'CUSTOM',
    description: 'Create memorable custom aliases.',
    icon: Edit3,
  },
  {
    id: '04',
    title: 'EXPIRING',
    description: 'Let links expire when they need to.',
    icon: Timer,
  },
];

export function Features() {
  return (
    <section id="features" className="features-section">
      <div className="section-container">
        {/* Section Heading */}
        <div className="section-header">
          <h2 className="section-title">
            SMALL LINKS.<br />
            BIG UTILITY.
          </h2>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="features-grid">
          {featuresData.map((item) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={item.id} 
                className="feature-card"
              >
                <div className="feature-card-top">
                  <div className="feature-icon-badge">
                    <IconComponent size={20} strokeWidth={2.2} />
                  </div>
                  <span className="feature-number">{item.id}</span>
                </div>

                <div className="feature-card-body">
                  <h3 className="feature-name">{item.title}</h3>
                  <p className="feature-desc">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Features;
