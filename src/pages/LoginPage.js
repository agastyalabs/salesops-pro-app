import React, { useState } from 'react';
import { auth } from '../utils/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setIsLoading(true);

    if (!email || !password) {
      setLocalError('Email and password are required.');
      setIsLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state will redirect via App.js
    } catch (error) {
      let message = "An unknown error occurred during login.";
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/invalid-email'
      ) {
        message = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your connection and try again.';
      } else if (error.code) {
        message = error.message;
      }
      setLocalError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign in to SalesOps Pro</h2>
        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {localError && <div className="text-red-600 text-sm">{localError}</div>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md"
          >
            {isLoading ? "Logging in..." : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
