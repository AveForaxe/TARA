export const getApiBaseUrl = () => {
  const currentHost = window.location.hostname;
  
  // Jika di localhost, kita bisa panggil langsung ke port 5000
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://localhost:5000';
  }

  // Jika di ngrok atau network IP, biarkan Vite Proxy (/api) yang menangani.
  // Dengan mengembalikan string kosong, fetch akan menggunakan domain yang sama dengan frontend.
  return '';
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const adminToken = sessionStorage.getItem('tara_admin_token');
  const userToken = localStorage.getItem('tara_token');
  const token = adminToken || userToken;
  
  const deviceId = localStorage.getItem('tara_device_id') || `${navigator.platform}-${window.screen.width}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    'x-device-id': deviceId,
    ...options.headers,
  };

  return fetch(`${getApiBaseUrl()}${endpoint}`, {
    ...options,
    headers,
  });
};
