'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [registerStep, setRegisterStep] = useState(1);
  const [role, setRole] = useState<'employee' | 'manager'>('employee');
  const [inviteCode, setInviteCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const options = [
    { value: 'employee', label: 'Employee' },
    { value: 'manager', label: 'Manager' }
  ];

  useEffect(() => {
    // Closes the custom dropdown component when a click outside its area is detected.
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validatePassword = (pass: string) => {
    // Validates that the password meets security requirements (min 8 chars, 1 uppercase, 1 number, 1 special).
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pass);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    // Verifies the invitation code submitted during the first step of registration.
    e.preventDefault();
    setError('');
    
    if (inviteCode === 'SAP2026') {
      setRegisterStep(2);
    } else {
      setError('Invalid or expired invitation code.');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    // Validates inputs and sets authentication data in local storage to simulate a login session.
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }
    localStorage.setItem('user_role', role);
    localStorage.setItem('username', username);
    router.push('/');
  };

  const handleRegister = (e: React.FormEvent) => {
    // Validates registration form details and creates a simulated session in local storage.
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
    
    localStorage.setItem('user_role', 'employee');
    localStorage.setItem('username', username);
    router.push('/');
  };

  const selectedLabel = options.find(opt => opt.value === role)?.label;

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
    >
      <div
        className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-md"
      >
        <div
          className="text-center mb-8"
        >
          <h2
            className="text-2xl font-bold text-gray-900"
          >
            Corporate Expense Tracker
          </h2>
          <p
            className="text-sm text-gray-500 mt-2"
          >
            {isLogin ? 'Enter your credentials to login' : 'New Employee Registration'}
          </p>
        </div>

        {error && (
          <div
            className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg"
          >
            {error}
          </div>
        )}

        {isLogin ? (
          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
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
              <label
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
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
              <label
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Select Role
              </label>
              <div
                className="relative"
                ref={dropdownRef}
              >
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between px-5 py-2.5 bg-white border-2 border-[#8e082d] rounded-full focus:outline-none text-[#111827] font-semibold text-sm transition-shadow"
                >
                  <span>
                    {selectedLabel}
                  </span>
                  <svg
                    className={`h-4 w-4 text-[#111827] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div
                    className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg py-2"
                  >
                    {options.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setRole(option.value as 'employee' | 'manager');
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors ${role === option.value ? 'text-[#8e082d] bg-gray-50' : 'text-[#374151] hover:bg-gray-50'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 bg-[#8e082d] hover:bg-red-900 text-white font-medium rounded-lg transition shadow-sm"
            >
              Access System
            </button>
          </form>
        ) : registerStep === 1 ? (
          <form
            onSubmit={handleVerifyCode}
            className="space-y-5"
          >
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
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
          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
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
              <label
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
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
              <label
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
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

        <div
          className="mt-6 text-center"
        >
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