const API_URL = 'http://localhost:8080/api';

export const api = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) {
      const error: any = new Error(data.message || 'API Error');
      error.status = res.status;
      error.data = data;
      throw error;
    }
    return data;
  });
}; 