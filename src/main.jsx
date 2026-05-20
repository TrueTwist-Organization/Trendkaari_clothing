import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/responsive.css';
import App from './App.jsx';
import AdminApp from './admin/AdminApp.jsx';

const isAdminRoute =
  typeof window !== 'undefined' &&
  (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/'));

createRoot(document.getElementById('root')).render(
  <StrictMode>{isAdminRoute ? <AdminApp /> : <App />}</StrictMode>
);
