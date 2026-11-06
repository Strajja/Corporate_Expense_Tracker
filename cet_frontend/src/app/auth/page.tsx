'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';

/**
 * AuthPage Component
 * Handles the authentication flow including user login and two-step registration (code verification & account creation).
 */
export default function AuthPage() {
  const { t, language, setLanguage } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [registerStep, setRegisterStep] = useState(1);
  const [inviteCode, setInviteCode] = useState('');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // State for Demo Access Modal
  const [showDemo, setShowDemo] = useState(false);
  
  const router = useRouter();

  // Triggers the Demo Modal to appear shortly after the page loads
  useEffect(() => {
    const timer = setTimeout(() => setShowDemo(true), 500);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Validates password strength via regex.
   * Requires: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.
   */
  const validatePassword = (pass: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pass);
  };

  /**
   * Handles the first step of registration by ensuring an invite code is provided.
   */
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (inviteCode.trim() !== '') {
      setRegisterStep(2);
    } else {
      setError(t('errorInvalidCode'));
    }
  };

  /**
   * Submits user credentials to authenticate and retrieves the JWT token and user role.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError(t('errorFillAllFields'));
      return;
    }

    try {
      const response = await api.post('/users/login', { username, password });
      const token = response.data.token || response.data.jwt || response.data.accessToken || response.data;

      if (token && typeof token === 'string') {
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('username', username);
        
        // Store language preference if provided by backend
        if (response.data.language) {
          localStorage.setItem('language', response.data.language.toLowerCase());
          setLanguage(response.data.language.toLowerCase());
        }

        // Decode JWT payload to extract user role securely
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));
          if (payload.role) {
            localStorage.setItem('user_role', payload.role.toLowerCase());
            localStorage.setItem('user_id', payload.id || payload.userId || '');
          }
        } catch (e) {
          console.error("Error reading role from token", e);
        }

        window.location.href = '/';
      } else {
        setError(t('errorLoginFailed'));
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.status === 401 || err.response?.status === 403 || err.response?.status === 404) {
        setError(t('errorInvalidCredentials'));
      } else {
        setError(err.response?.data?.message || err.response?.data || t('errorLoginFailed'));
      }
    }
  };

  /**
   * Completes the user registration process using the verified invite code and new credentials.
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password || !confirmPassword) {
      setError(t('errorFillAllFields'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('errorPasswordMismatch'));
      return;
    }
    if (!validatePassword(password)) {
      setError(t('errorPasswordStrength'));
      return;
    }
    
    try {
      const response = await api.post('/users/register', {
        username,
        password,
        code: inviteCode
      });

      const token = response.data.token || response.data.jwt || response.data.accessToken;

      if (token && typeof token === 'string') {
        localStorage.setItem('jwt_token', token);
        
        // Store language preference if provided by backend
        if (response.data.language) {
          localStorage.setItem('language', response.data.language.toLowerCase());
          setLanguage(response.data.language.toLowerCase());
        }

        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));
          if (payload.role) {
            localStorage.setItem('user_role', payload.role.toLowerCase());
            localStorage.setItem('user_id', payload.id || payload.userId || '');
          }
        } catch (e) {
          console.error("Error reading role from token", e);
        }
      }
      
      localStorage.setItem('username', username);
      window.location.href = '/';
      
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.response?.data || t('errorRegistrationFailed'));
    }
  };

  /**
   * DEMO HELPER FUNCTIONS
   * Auto-fills the login form or copies admin credentials for testing.
   */
  const autoFillAdmin = () => {
    setUsername('admin');
    setPassword('admin123');
  };

  const copyUsername = () => {
    navigator.clipboard.writeText('admin');
  };

  const copyPassword = () => {
    navigator.clipboard.writeText('admin123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{t('appTitle')}</h2>
          <p className="text-sm text-gray-500 mt-2">
            {isLogin ? t('loginSubtitle') : t('registerSubtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Conditional rendering based on Authentication context */}
        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('usernameLabel')}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('passwordLabel')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900 placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 bg-[#8e082d] hover:bg-red-900 text-white font-medium rounded-lg transition shadow-sm cursor-pointer"
            >
              {t('accessSystemBtn')}
            </button>
          </form>
        ) : registerStep === 1 ? (
          <form onSubmit={handleVerifyCode} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('registrationCodeLabel')}</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900 placeholder-gray-400"
                placeholder={t('registrationCodePlaceholder')}
              />
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 bg-[#8e082d] hover:bg-red-900 text-white font-medium rounded-lg transition shadow-sm cursor-pointer"
            >
              {t('verifyCodeBtn')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('usernameLabel')}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('passwordLabel')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('confirmPasswordLabel')}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900 placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 bg-[#8e082d] hover:bg-red-900 text-white font-medium rounded-lg transition shadow-sm cursor-pointer"
            >
              {t('createAccountBtn')}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setRegisterStep(1);
              setError('');
              setUsername('');
              setPassword('');
              setConfirmPassword('');
              setInviteCode('');
            }}
            className="text-sm text-[#8e082d] hover:underline font-medium cursor-pointer"
          >
            {isLogin ? t('switchToRegister') : t('switchToLogin')}
          </button>
        </div>

        {/* Language Switcher for Auth Page */}
        <div className="mt-8 flex items-center justify-center gap-3 font-bold text-sm border-t border-gray-100 pt-6">
          <button 
            type="button"
            onClick={() => setLanguage('en')}
            className={`transition-colors duration-300 cursor-pointer ${language === 'en' ? 'text-[#8e082d]' : 'text-gray-400 hover:text-gray-800'}`}
          >
            ENG
          </button>
          <span className="text-gray-300">|</span>
          <button 
            type="button"
            onClick={() => setLanguage('sr')}
            className={`transition-colors duration-300 cursor-pointer ${language === 'sr' ? 'text-[#8e082d]' : 'text-gray-400 hover:text-gray-800'}`}
          >
            СРП
          </button>
        </div>
      </div>

      {/* DEMO WIDGET - Slides in on the bottom right to facilitate easy testing */}
      {showDemo && (
        <div className="fixed bottom-6 right-6 bg-white p-5 rounded-xl shadow-2xl border border-[#8e082d] w-80 z-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900">Demo Access</h3>
            <button 
              onClick={() => setShowDemo(false)} 
              className="text-gray-400 hover:text-gray-700 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            This is a demo project for testing purposes. Check the github repository for more information and to see how it works.
          </p>

          <div className="text-xs text-gray-700 mb-4 bg-gray-50 p-2.5 rounded border border-gray-200 space-y-1">
            <div><strong>Username:</strong> admin</div>
            <div><strong>Password:</strong> admin123</div>
          </div>

          <div className="space-y-2">
            <button 
              onClick={autoFillAdmin}
              className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium rounded transition shadow-sm cursor-pointer"
            >
              Auto-fill Admin Credentials
            </button>
            <div className="flex gap-2">
              <button 
                onClick={copyUsername}
                className="w-1/2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded transition border border-gray-200 cursor-pointer"
              >
                Copy Username
              </button>
              <button 
                onClick={copyPassword}
                className="w-1/2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded transition border border-gray-200 cursor-pointer"
              >
                Copy Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}