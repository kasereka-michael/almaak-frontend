import axios from 'axios';

// API configuration for session-based authentication
const API = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
    timeout: 30000,
    withCredentials: true,
});

// Request Interceptor
API.interceptors.request.use(
    (config) => {
        // Automatically handle Content-Type for JSON or FormData
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type']; // Let the browser handle it for FormData
  
        } else {
            config.headers['Content-Type'] = 'application/json'; // JSON for other requests
        }

        // Session-based: cookies will be sent via withCredentials
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('Request setup error:', error);
        return Promise.reject(new Error('Request configuration error.'));
    }
);

// Response Interceptor
API.interceptors.response.use(
    (response) => {
        // Debugging: Log the response details
        console.log(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
    },
    (error) => {
        if (error.response) {
            // Extracting the status and response data for error handling
            const status = error.response.status;
            const data = error.response.data;

            console.error(`API Error: ${status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, data);

            // Handle specific errors like 401 or 403
            if (status === 401) {
                // Authentication disabled: treat as generic error
                return Promise.reject(new Error('Unauthorized'));
            } else if (status === 403) {
                // Forbidden - insufficient permissions to access resource
                const message = data?.message || 'You do not have permission to perform this action.';
                return Promise.reject(new Error(message));
            }

            // General error message
            const message = data?.message || `Request failed with status ${status}`;
            return Promise.reject(new Error(message));
        } else if (error.request) {
            // Handle cases when no response is received (CORS or network issues)
            console.error('No response from server. Possible CORS or network error.');
            return Promise.reject(
                new Error(
                    'No response from server. This might be a CORS issue or the server is unreachable.'
                )
            );
        } else {
            // General Axios error
            console.error('Unexpected Axios error:', error.message);
            return Promise.reject(new Error(`Unexpected error: ${error.message}`));
        }
    }
);

export default API;
