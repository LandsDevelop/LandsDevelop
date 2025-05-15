const API_BASE = 'http://localhost:5174/api';  // Replace with your backend URL if deployed

export const api = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token'); // Or use a context/state if available

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
};
