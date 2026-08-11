// src/main.tsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './fontawesome.ts';
import App from './App.tsx';
import { AuthProvider } from './context/AuthProvider';
import { BrowserRouter } from 'react-router-dom';
import { readAccessMode } from './storage/sessionStorage';
import { readActiveAdminThemeSnapshot } from './storage/adminThemeRuntimeStorage';
import { applyChoirThemeToDocument } from './utils/choirThemeDocument';

if (window.location.pathname.startsWith('/admin') && readAccessMode() === 'tenant') {
    const restoredTheme = readActiveAdminThemeSnapshot();

    if (restoredTheme) {
        applyChoirThemeToDocument(restoredTheme.theme, restoredTheme.choirCode);
    }
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
);
