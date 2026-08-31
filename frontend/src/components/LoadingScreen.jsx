import React from 'react';
import { LogoMark } from './Logo';

export function LoadingScreen({ message = 'INITIALIZING...' }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#F4F0EA',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: 'Space Grotesk, sans-serif',
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '3px solid #0D0D0D',
        boxShadow: '6px 6px 0px #0D0D0D',
        padding: '36px 44px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '18px',
        maxWidth: '360px',
        width: '90%',
        textAlign: 'center',
      }}>
        <LogoMark size={44} />
        
        <div style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 900,
          fontSize: '1.4rem',
          letterSpacing: '-0.03em',
          color: '#0D0D0D',
        }}>
          SHRNK
        </div>

        <div style={{
          backgroundColor: '#CEFF00',
          border: '2px solid #0D0D0D',
          boxShadow: '2px 2px 0px #0D0D0D',
          padding: '6px 14px',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 800,
          fontSize: '0.75rem',
          letterSpacing: '0.06em',
          color: '#0D0D0D',
        }}>
          {message}
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
