import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from '@asgardeo/auth-react'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider
      config={ {
        signInRedirectURL: 'http://localhost:5173',
        signOutRedirectURL: 'http://localhost:5173',
        clientID: 'Rxzf4BLJUao3_Fr5nq3bWiVmPYEa',
        baseUrl: 'https://api.asgardeo.io/t/wso2conasia',
        scope: ['openid', 'profile'],
      } }
    >
      <App />
    </AuthProvider>
  </StrictMode>,
)
