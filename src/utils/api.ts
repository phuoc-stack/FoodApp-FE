export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });
  
    // Handle expired token / unauthorized
    if (response.status === 401 || response.status === 403) {
      // Clear invalid token
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Redirect to login
      alert('Your session has expired. Please login again.');
      window.location.href = '/login';
      
      throw new Error('Session expired');
    }
  
    return response;
  };