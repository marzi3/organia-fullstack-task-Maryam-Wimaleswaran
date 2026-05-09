/**
 * Auth utility functions for client-side token management.
 */

/** Check if a JWT token exists in localStorage. */
export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}

/** Retrieve stored user data. */
export function getUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

/** Retrieve stored JWT token. */
export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/** Clear all auth data from localStorage. */
export function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
