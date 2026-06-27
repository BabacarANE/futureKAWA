import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../App'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* ThemeProvider au niveau racine → dark mode global via ThemeContext */}
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
)