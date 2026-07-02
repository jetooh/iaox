import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './env'; // validates env vars at startup (Zod)
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
