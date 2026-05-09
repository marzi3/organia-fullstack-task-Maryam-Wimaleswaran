const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

/**
 * Centralized API service for communicating with the Spring Boot backend.
 * Handles JWT token injection, error normalization, and response parsing.
 */

/** Retrieve the stored JWT token from localStorage. */
function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

/**
 * Core fetch wrapper — injects Authorization header and normalizes errors.
 * @param {string} endpoint - API endpoint path (e.g., '/tasks')
 * @param {object} options - Fetch options (method, body, headers)
 * @returns {Promise<any>} Parsed JSON response
 */
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || errorData.error || 'Request failed');
    error.status = response.status;
    error.fieldErrors = errorData.fieldErrors;
    throw error;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// --- Auth API ---

export async function registerUser(data) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function loginUser(data) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// --- Tasks API ---

export async function getTasks(status, search) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (search) params.append('search', search);
  const queryString = params.toString();
  return request(`/tasks${queryString ? `?${queryString}` : ''}`);
}

export async function getTaskSummary() {
  return request('/tasks/summary');
}

export async function createTask(data) {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTask(id, data) {
  return request(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateTaskStatus(id, status) {
  return request(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteTask(id) {
  return request(`/tasks/${id}`, {
    method: 'DELETE',
  });
}
