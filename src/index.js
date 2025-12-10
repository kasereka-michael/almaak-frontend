import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/tailwind.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// For development, auto-login with admin credentials
if (process.env.NODE_ENV === 'development') {
  // Auto-login in development mode
  const autoLogin = async () => {
    try {
      const authService = (await import('./services/authService')).default;
      const isLoggedIn = authService.isLoggedIn();
      
      if (!isLoggedIn) {
        console.log('Development mode: Auto-logging in with admin credentials...');
        await authService.login('admin@almaakcorp.com', '@Lmaakcorp2024');
        console.log('Development mode: Auto-login successful');
      }
    } catch (error) {
      console.warn('Development mode: Auto-login failed, manual login required:', error.message);
    }
  };
  
  // Delay auto-login to allow components to mount
  setTimeout(autoLogin, 1000);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
