import React, { useState } from 'react';
import { getShortUrlDisplay, getFullShortUrl, DOMAIN_NAME } from '../config';

const constantLinks = [
  {
    id: '1',
    original: 'github.com/johndoe/project',
    code: 'a7Kx92',
    clicks: '1,284',
    created: '12 days ago',
  },
  {
    id: '2',
    original: `docs.${DOMAIN_NAME}/getting-started/api`,
    code: 'Qm3vTz',
    clicks: '842',
    created: '8 days ago',
  },
  {
    id: '3',
    original: 'notion.so/team/q3-launch-checklist',
    code: 'kb91Rd',
    clicks: '417',
    created: '5 days ago',
  },
  {
    id: '4',
    original: 'youtube.com/watch?v=dQw4w9WgXcQ',
    code: '9pLmXe',
    clicks: '96',
    created: '2 days ago',
  },
  {
    id: '5',
    original: 'figma.com/@johndoe/design-system',
    code: '5bK9qL',
    clicks: '64',
    created: '1 day ago',
  },
];

export function DashboardPreview() {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (link) => {
    navigator.clipboard.writeText(getFullShortUrl(link.code));
    setCopiedId(link.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // SVG Sparkline Curves
  const renderSparkline = (linkId) => {
    switch (linkId) {
      case '1':
        return (
          <svg viewBox="0 0 54 18" width="54" height="18" className="sparkline-svg">
            <path d="M 3 15 Q 27 13, 51 3" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case '2':
        return (
          <svg viewBox="0 0 54 18" width="54" height="18" className="sparkline-svg">
            <path d="M 3 13 Q 16 3, 27 13 T 51 5" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case '3':
        return (
          <svg viewBox="0 0 54 18" width="54" height="18" className="sparkline-svg">
            <path d="M 3 13 Q 18 11, 32 5 T 51 5" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case '4':
        return (
          <svg viewBox="0 0 54 18" width="54" height="18" className="sparkline-svg">
            <path d="M 3 15 Q 22 14, 34 11 T 51 3" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case '5':
      default:
        return (
          <svg viewBox="0 0 54 18" width="54" height="18" className="sparkline-svg">
            <path d="M 3 14 Q 20 15, 36 8 T 51 4" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <section id="dashboard" className="dashboard-section">
      <div className="section-container">
        {/* Section Heading */}
        <div className="section-header">
          <h2 className="section-title">
            YOUR LINKS. ONE PLACE.
          </h2>
          <p className="section-subtitle">
            A preview of the SHRNK dashboard. Fictional data.
          </p>
        </div>

        {/* Dashboard Box / Table Container */}
        <div className="dashboard-card-container">
          {/* Header Bar */}
          <div className="dashboard-table-header">
            <div className="dashboard-table-title">
              <span className="title-square">■</span>
              <span className="title-text">SHRNK / LINKS</span>
            </div>
            <div className="dashboard-table-count">
              {constantLinks.length} LINKS
            </div>
          </div>

          {/* Table / List Container */}
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th className="col-original">ORIGINAL</th>
                  <th className="col-short">SHORT</th>
                  <th className="col-clicks">CLICKS</th>
                  <th className="col-created">CREATED</th>
                  <th className="col-trend">TREND</th>
                  <th className="col-action"></th>
                </tr>
              </thead>
              <tbody>
                {constantLinks.map((link) => (
                  <tr key={link.id} className="dashboard-row">
                    {/* Original URL */}
                    <td className="cell-original">
                      <span className="url-text" title={link.original}>
                        {link.original}
                      </span>
                    </td>

                    {/* Short URL Badge */}
                    <td className="cell-short">
                      <span className="short-badge">
                        {getShortUrlDisplay(link.code)}
                      </span>
                    </td>

                    {/* Clicks */}
                    <td className="cell-clicks">
                      <span className="clicks-number">{link.clicks}</span>
                    </td>

                    {/* Created */}
                    <td className="cell-created">
                      <span className="created-text">{link.created}</span>
                    </td>

                    {/* Sparkline Trend */}
                    <td className="cell-trend">
                      <div className="trend-wrapper">
                        {renderSparkline(link.id)}
                      </div>
                    </td>

                    {/* Action / Copy Button */}
                    <td className="cell-action">
                      <button
                        type="button"
                        onClick={() => handleCopy(link)}
                        className={`btn-table-copy ${copiedId === link.id ? 'copied' : ''}`}
                        title="Copy to clipboard"
                      >
                        {copiedId === link.id ? 'COPIED' : 'COPY'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DashboardPreview;
