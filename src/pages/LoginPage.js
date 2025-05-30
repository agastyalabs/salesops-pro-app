import React, { useState } from 'react';
import { AtSign, KeyRound } from 'lucide-react';
import AuthPageLayout from './AuthPageLayout'; // Remove curly brackets if default export
import InputField from '../components/InputField'; // Remove curly brackets if default export
import { LoadingSpinner } from '../components/LoadingSpinner';
import { auth } from '../utils/firebase'; // Import from your firebase.js
import { signInWithEmailAndPassword } from 'firebase/auth';

const LoginPage = ({ setCurrentViewFunction, setError, setSuccess, theme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Debug to verify component mounts
  console.log("LoginPage component mounted");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError && setError(null);
    setSuccess && setSuccess(null);
    setLocalError(null);
    setIsLoading(true);

    if (!email || !password) {
      setLocalError('Email and password are required.');
      setIsLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess && setSuccess('Login successful!');
      setCurrentViewFunction && setCurrentViewFunction('dashboard');
    } catch (error) {
      console.error("Error logging in:", error);
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
      setError && setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove the curly brackets if your components are default exports!
  // If you get "TypeError: ... is not a function" or "Cannot read property of undefined"
  // on AuthPageLayout or InputField, use the import without curly brackets.

  return (
    <AuthPageLayout title="Log In to Your Account" theme={theme}>
      <form onSubmit={handleLogin} className="space-y-4">
        <InputField
          icon={AtSign}
          label="Email Address"
          id="email-login"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <InputField
          icon={KeyRound}
          label="Password"
          id="password-login"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        {localError && (
          <div className="text-red-600 text-sm">{localError}</div>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition"
        >
          {isLoading ? <LoadingSpinner text="" size="sm" /> : 'Log In'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={() => setCurrentViewFunction && setCurrentViewFunction('signup')}
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Sign up
        </button>
      </p>
    </AuthPageLayout>
  );
};

export default LoginPage;
