import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// DEMO TP4: import a un archivo que no existe -> el build de Vite falla.
import { algo } from './modulo-inexistente.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
