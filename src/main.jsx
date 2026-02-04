import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css'
import App from './App.jsx'
import { theme } from './theme';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Create root element
const container = document.getElementById('root');
const root = createRoot(container);


// Render app
root.render(
  <StrictMode>
    <HashRouter>
      <GoogleOAuthProvider clientId="654131058807-15p8l5r4ddlusbeavvhiin9rt2cuglh6.apps.googleusercontent.com">
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </GoogleOAuthProvider>
    </HashRouter>
  </StrictMode>
);
