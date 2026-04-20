import React, { useEffect } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './EmailLogin.css';

interface EmailLoginProps {
  onLogin: (email: string, name: string) => void;
  isLoggedIn: boolean;
  userEmail: string | null;
  userName?: string | null;
}

interface DecodedToken {
  email: string;
  name: string;
  picture?: string;
}

export const EmailLogin: React.FC<EmailLoginProps> = ({
  onLogin,
  isLoggedIn,
  userEmail,
  userName,
}) => {
  useEffect(() => {
    const savedEmail = localStorage.getItem('gps_tracking_user_email');
    const savedName = localStorage.getItem('gps_tracking_user_name');
    if (savedEmail && savedName) {
      onLogin(savedEmail, savedName);
    }
  }, [onLogin]);

  const handleLoginSuccess = (credentialResponse: CredentialResponse) => {
    try {
      const decoded = jwtDecode<DecodedToken>(credentialResponse.credential!);
      localStorage.setItem('gps_tracking_user_email', decoded.email);
      localStorage.setItem('gps_tracking_user_name', decoded.name);
      onLogin(decoded.email, decoded.name);
    } catch (error) {
      console.error('Failed to decode token:', error);
      alert('Login fehlgeschlagen. Bitte versuche es erneut.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gps_tracking_user_email');
    localStorage.removeItem('gps_tracking_user_name');
    window.location.reload();
  };

  if (isLoggedIn && userEmail) {
    return (
      <div className="email-login logged-in">
        <div className="user-info">
          <span className="welcome-text">👤 {userName || userEmail}</span>
          <p className="email-text">{userEmail}</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="email-login">
      <div className="login-container">
        <h3>Mit Google anmelden</h3>
        <p>Melde dich mit deinem Google-Konto an um Reports zu versenden</p>
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={() => console.log('Login Failed')}
          locale="de_DE"
        />
      </div>
    </div>
  );
};

export default EmailLogin;
