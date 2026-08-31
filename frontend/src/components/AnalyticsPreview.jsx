import React from 'react';
import { getShortUrlDisplay } from '../config';

const analyticsMetrics = [
  { label: 'TOTAL CLICKS', value: '1,284' },
  { label: 'UNIQUE VISITORS', value: '902' },
  { label: 'TOP COUNTRY', value: 'India' },
  { label: 'DEVICE', value: 'Mobile 63%' },
  { label: 'REFERRER', value: 'x.com' },
];

const chartData = [
  { day: 'M', value: 42 },
  { day: 'T', value: 68 },
  { day: 'W', value: 55 },
  { day: 'T', value: 91 },
  { day: 'F', value: 74 },
  { day: 'S', value: 33 },
  { day: 'S', value: 48 },
];

export function AnalyticsPreview() {
  const maxValue = 100; // Normalized to 100 for clean proportions

  return (
    <section id="analytics" className="analytics-section">
      <div className="section-container">
        {/* Section Heading */}
        <div className="section-header">
          <h2 className="section-title">
            KNOW WHERE YOUR LINKS GO.
          </h2>
        </div>

        {/* 2-Card Container Grid */}
        <div className="analytics-grid">
          {/* Card 1: Key Metrics List */}
          <div className="analytics-card metrics-card">
            <div className="analytics-card-header">
              <span className="analytics-link-tag">{getShortUrlDisplay('a7Kx92').toUpperCase()}</span>
            </div>

            <div className="metrics-list">
              {analyticsMetrics.map((item, idx) => (
                <div key={idx} className="metric-row">
                  <span className="metric-label">{item.label}</span>
                  <span className="metric-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: 7-Day Bar Chart */}
          <div className="analytics-card chart-card">
            <div className="chart-header">
              <span className="chart-title">CLICKS / LAST 7 DAYS</span>
              <span className="chart-growth-badge">+18%</span>
            </div>

            <div className="bar-chart-container">
              <div className="bars-wrapper">
                {chartData.map((item, idx) => {
                  const heightPercent = Math.round((item.value / maxValue) * 100);

                  return (
                    <div key={idx} className="bar-column">
                      {/* Value label above bar */}
                      <span className="bar-value-label">
                        {item.value}
                      </span>

                      {/* Bar Pillar */}
                      <div className="bar-track">
                        <div 
                          className="bar-fill"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>

                      {/* Day Label below bar */}
                      <span className="bar-day-label">{item.day}</span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Baseline */}
              <div className="chart-baseline" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AnalyticsPreview;
