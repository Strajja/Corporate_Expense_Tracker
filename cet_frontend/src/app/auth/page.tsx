'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [registerStep, setRegisterStep] = useState(1);
  const [inviteCode, setInviteCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const router = useRouter();

  const validatePassword = (pass: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pass);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (inviteCode === 'SAP2026') {
      setRegisterStep(2);
    } else {
      setError('Invalid or expired invitation code.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const response = await api.post('/users/login', {
        username,
        password
      });

      const token = response.data.token || response.data.jwt || response.data.accessToken || response.data;

      if (token && typeof token === 'string') {
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('username', username);
        router.push('/');
      } else {
        setError('Nevažeći format tokena sa servera.');
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Invalid username or password.');
      } else {
        setError(err.response?.data?.message || err.response?.data || 'An error occurred during login. Please try again.');
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must contain at least 8 characters, an uppercase letter, a number, and a special character.');
      return;
    }
    
    try {
      const response = await api.post('/users/register', {
        username,
        password
      });

      const token = response.data.token || response.data.jwt || response.data.accessToken;

      if (token && typeof token === 'string') {
        localStorage.setItem('jwt_token', token);
      }
      
      localStorage.setItem('username', username);
      router.push('/');
      
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || 'Registration failed. Username might be taken.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Corporate Expense Tracker
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {isLogin ? 'Enter your credentials to login' : 'New Employee Registration'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900 placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 bg-[#8e082d] hover:bg-red-900 text-white font-medium rounded-lg transition shadow-sm"
            >
              Access System
            </button>
          </form>
        ) : registerStep === 1 ? (
          <form onSubmit={handleVerifyCode} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Registration Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900 placeholder-gray-400"
                placeholder="Enter code from email (e.g. SAP2026)"
              />
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 bg-[#8e082d] hover:bg-red-900 text-white font-medium rounded-lg transition shadow-sm"
            >
              Verify Code
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900 placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 bg-[#8e082d] hover:bg-red-900 text-white font-medium rounded-lg transition shadow-sm"
            >
              Create Account
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
            className="text-sm text-[#8e082d] hover:underline font-medium"
          >
            {isLogin ? 'Have an invitation code? Register' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}