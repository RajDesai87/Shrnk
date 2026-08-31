// Centralized configuration and URL helpers for SHRNK

const RAW_BASE_URL = 
  import.meta.env.VITE_BASE_URL || 
  import.meta.env.BASE_URL || 
  'https://shrnk.in';

// Extract pure domain/hostname without protocol or trailing slashes (e.g. "shrnk.in" or "localhost:5173")
export const DOMAIN_NAME = RAW_BASE_URL.replace(/^https?:\/\//i, '').replace(/\/+$/, '');

// Base URL with protocol (e.g. "https://shrnk.in" or "http://localhost:5173")
export const BASE_URL = /^https?:\/\//i.test(RAW_BASE_URL)
  ? RAW_BASE_URL.replace(/\/+$/, '')
  : `https://${RAW_BASE_URL.replace(/\/+$/, '')}`;

/**
 * Returns formatted short link display string (e.g. "shrnk.in/a7Kx92")
 */
export function getShortUrlDisplay(code) {
  return `${DOMAIN_NAME}/${code}`;
}

/**
 * Returns full short link URL with protocol (e.g. "https://shrnk.in/a7Kx92")
 */
export function getFullShortUrl(code) {
  return `${BASE_URL}/${code}`;
}
