'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';

/**
 * AccountPage Component
 * Provides a user interface for managing account settings, including username and password updates.
 */
export default function AccountPage() {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [newUsernameInput, setNewUsernameInput] = useState('');
  const [role, setRole] = useState('');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [usernameMessage, setUsernameMessage] = useState('');
  const [usernameError, setUsernameError] = useState('');
  
  const router = useRouter();

  // Load current user data from local storage on component mount
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('user_role');
    
    if (!storedUsername || !storedRole) {
      router.push('/auth');
    } else {
      setUsername(storedUsername);
      setRole(storedRole);
    }
  }, [router]);

  /**
   * Handles password update request.
   * Validates matching passwords before sending the API request.
   */
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError(t('errorPasswordMismatch'));
      return;
    }

    try {
      await api.patch(`/users/me/password`, null, {
        params: { oldPassword, newPassword }
      });
      
      setPasswordMessage(t('msgPasswordUpdated'));
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Password update error:', err);
      setPasswordError(err.response?.data?.message || err.response?.data || t('errorUpdatePassword'));
    }
  };

  /**
   * Handles username update request.
   * Clears local storage and redirects to authentication upon success.
   */
  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameMessage('');
    setUsernameError('');

    try {
      await api.patch('/users/me/username', { newUsername: newUsernameInput });
      setUsernameMessage(t('msgUsernameUpdated'));
      
      setTimeout(() => {
        const savedLanguage = localStorage.getItem("language");
        localStorage.clear();
        
        if (savedLanguage) {
          localStorage.setItem("language", savedLanguage);
        }
        
        router.push('/auth');
      }, 2000);
    } catch (err: any) {
      console.error('Username update error:', err);
      setUsernameError(err.response?.data?.message || err.response?.data || t('errorUpdateUsername'));
    }
  };

  return (
    <div className="p-8 w-full max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('accountSettingsTitle')}</h1>
        <p className="text-gray-500 mt-1">{t('accountSettingsDesc')}</p>
      </div>

      {/* Profile Information Section */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-4">{t('profileInfoTitle')}</h2>
        
        {usernameMessage && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg font-medium">
            {usernameMessage}
          </div>
        )}

        {usernameError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg font-medium">
            {usernameError}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('currentUsernameLabel')}</label>
            <input
              type="text"
              disabled
              value={username}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('roleLabel')}</label>
            <input
              type="text"
              disabled
              value={role.toUpperCase()}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-[#8e082d] font-bold cursor-not-allowed"
            />
          </div>
        </div>
        
        <form onSubmit={handleUsernameChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('newUsernameLabel')}</label>
            <div className="flex gap-4">
              <input
                required
                type="text"
                value={newUsernameInput}
                onChange={(e) => setNewUsernameInput(e.target.value)}
                className="w-full md:w-1/2 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900"
                placeholder={t('newUsernamePlaceholder')}
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition shadow-sm whitespace-nowrap cursor-pointer"
              >
                {t('changeUsernameBtn')}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {t('usernameChangeWarning')}
            </p>
          </div>
        </form>
      </div>

      {/* Password Change Section */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-4">{t('changePasswordTitle')}</h2>

        {passwordMessage && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg font-medium">
            {passwordMessage}
          </div>
        )}

        {passwordError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg font-medium">
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('oldPasswordLabel')}</label>
            <input
              required
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900"
              placeholder={t('oldPasswordPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('newPasswordLabel')}</label>
              <input
                required
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900"
                placeholder={t('newPasswordPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('confirmNewPasswordLabel')}</label>
              <input
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8e082d] text-gray-900"
                placeholder={t('confirmNewPasswordPlaceholder')}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-8 py-3 bg-[#8e082d] hover:bg-red-900 text-white font-medium rounded-lg transition shadow-sm cursor-pointer"
            >
              {t('updatePasswordBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}