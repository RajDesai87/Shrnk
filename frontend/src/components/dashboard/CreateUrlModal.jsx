import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../services/api';

export function CreateUrlModal({ isOpen, onClose, onSuccess, initialUrl = '' }) {
  const [originalUrl, setOriginalUrl] = useState(initialUrl);
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdResult, setCreatedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOriginalUrl(initialUrl);
      setCustomAlias('');
      setExpiresAt('');
      setError('');
      setCreatedResult(null);
      setCopied(false);
    }
  }, [isOpen, initialUrl]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedUrl = originalUrl.trim();
    const trimmedAlias = customAlias.trim();

    if (!trimmedUrl) {
      setError('Please enter a destination URL.');
      return;
    }

    if (trimmedAlias) {
      if (!/^[a-zA-Z0-9_-]+$/.test(trimmedAlias)) {
        setError('Alias can only contain letters, numbers, hyphens, and underscores.');
        return;
      }
      if (trimmedAlias.length < 3 || trimmedAlias.length > 64) {
        setError('Alias must be between 3 and 64 characters long.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const payloadExpires = expiresAt ? new Date(expiresAt).toISOString() : null;
      const res = await api.createUrl(
        trimmedUrl,
        trimmedAlias || null,
        payloadExpires,
      );

      setCreatedResult(res);
      // Trigger celebratory neubrutalist confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#CEFF00', '#0D0D0D', '#FFFFFF'],
      });

      if (onSuccess) {
        onSuccess(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to create short URL.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (createdResult) {
      navigator.clipboard.writeText(createdResult.short_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="dash-modal-overlay" onClick={onClose}>
      <div 
        className="dash-modal-box" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="dash-modal-header">
          <h3 className="dash-modal-title">
            {createdResult ? 'LINK CREATED' : 'SHRNK A NEW URL'}
          </h3>
          <button 
            type="button" 
            className="btn-modal-close" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="dash-modal-body">
          {error && (
            <div style={{
              backgroundColor: '#FFE5E5',
              border: '2px solid #FF4444',
              padding: '10px 14px',
              fontWeight: 800,
              fontSize: '0.85rem',
              color: '#CC0000',
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          {createdResult ? (
            <div>
              <div className="dash-success-box">
                <div className="dash-success-title">YOUR LINK IS READY.</div>
                
                <div className="dash-ready-url-row">
                  <span className="dash-short-badge" style={{ fontSize: '1rem', padding: '8px 14px' }}>
                    {createdResult.short_url.replace(/^https?:\/\//i, '')}
                  </span>
                  
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`btn-table-action ${copied ? 'copied' : ''}`}
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    {copied ? 'COPIED!' : 'COPY'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setCreatedResult(null);
                    setOriginalUrl('');
                    setCustomAlias('');
                  }}
                  className="btn-table-action"
                  style={{ flex: 1, padding: '12px' }}
                >
                  CREATE ANOTHER
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-dash-save"
                  style={{ flex: 1, padding: '12px' }}
                >
                  DONE
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="dash-form-group">
                <label className="dash-label">LONG URL *</label>
                <input
                  type="text"
                  required
                  placeholder="https://example.com/very/long/destination/url"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  className="dash-input"
                  style={{ fontFamily: 'var(--dash-font-mono)' }}
                  autoFocus
                />
              </div>

              <div className="dash-form-group">
                <label className="dash-label">CUSTOM ALIAS (OPTIONAL)</label>
                <input
                  type="text"
                  placeholder="e.g. my-project or launch-2026"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  className="dash-input"
                  style={{ fontFamily: 'var(--dash-font-mono)' }}
                />
              </div>

              <div className="dash-form-group">
                <label className="dash-label">EXPIRATION DATE (OPTIONAL)</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="dash-input"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-dash-save"
                style={{ width: '100%', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <span>{submitting ? 'SHRINKING...' : 'SHRNK'}</span>
                <ArrowRight size={18} strokeWidth={3} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateUrlModal;
