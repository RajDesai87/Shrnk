import React from 'react';

export function LogoMark({ className = '', size = 28 }) {
  return (
    <div 
      className={`logo-mark-wrapper ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label="SHRNK Logo"
    >
      <img
        src="/favicon.svg"
        alt="SHRNK Logo"
        width={size}
        height={size}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          borderRadius: '4px',
        }}
      />
    </div>
  );
}

export default LogoMark;
