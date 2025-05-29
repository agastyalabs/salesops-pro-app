// src/pages/LoginPage.js
import React, { useState } from 'react';
import { AtSign, KeyRound } from 'lucide-react';
import { AuthPageLayout } from './AuthPageLayout';
import { InputField } from '../components/InputField';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { auth } from '../utils/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const LoginPage = ({ setCurrentViewFunction, setError, setSuccess, theme }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setCurrentViewFunction('dashboard');
        } catch (error) {
            console.error("Error logging in:", error);
            if (
                error.code === 'auth/user-not-found' ||
                error.code === 'auth/wrong-password' ||
                error.code === 'auth/invalid-credential' ||
                error.code === 'auth/invalid-email'
            ) {
                setError('Invalid email or password. Please try again.');
            } else {
                setError(error.message || "An unknown error occurred during login.");
            }
        } finally {
            setIsLoading(false);
        }
    };

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
                {/* TODO: Add "Forgot Password?" link here later */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                >
                    {isLoading ? <LoadingSpinner text="" size="sm" /> : 'Log In'}
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button
                    onClick={() => setCurrentViewFunction('signup')}
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    Sign up
                </button>
            </p>
        </AuthPageLayout>
    );
};

export default LoginPage;
