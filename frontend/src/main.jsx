import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import "./index.css";
import App from './App.jsx';
import {  BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { TokenContextProvider } from './contexts/tokenContextProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    
      <BrowserRouter>
      <TokenContextProvider>
        <App />
      </TokenContextProvider>
      </BrowserRouter>
      <ToastContainer theme='Dark' />
  </StrictMode>,
)
