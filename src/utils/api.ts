export const API_BASE_URL = "http://localhost:9393";

/**
 * A utility function to wrap the fetch() call.
 * Automatically attaches authentication headers and handles both
 * JSON and FormData requests safely.
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  // Get the user's JWT from localStorage
  const token = localStorage.getItem("authToken");
  
  // If the token doesn't exist, it means the user isn't logged in
  if (!token) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Detect whether this request is sending a file (FormData) or a JSON payload 
  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
  };

  try {
    // Send the actual HTTP request using fetch().
    // Spread the original `options` (method, body, ...) so everything is preserved.
    // Attach the custom headers built above.
    return await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error(`API request failed: ${url}`, error);
    return new Response(JSON.stringify({ error: "Request failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
