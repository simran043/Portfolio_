import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AdminApp from './admin/AdminApp';
import App from './App';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { ToastProvider } from './context/ToastContext';

const isAdminRoute = window.location.pathname.startsWith('/admin');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      {isAdminRoute ? (
        <AdminApp />
      ) : (
        <AnalyticsProvider>
          <App />
        </AnalyticsProvider>
      )}
    </ToastProvider>
  </StrictMode>,
);
