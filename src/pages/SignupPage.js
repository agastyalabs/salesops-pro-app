import React, { useState } from 'react';
import { AtSign, KeyRound, UserRound } from 'lucide-react';
import AuthPageLayout from './AuthPageLayout';
import { InputField } from '../components/InputField';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { auth } from '../utils/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const SignupPage = ({ setCurrentViewFunction, setError, setSuccess, theme }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (fullName) {
                await updateProfile(userCredential.user, { displayName: fullName });
            }
            setSuccess('Account created successfully!');
            setCurrentViewFunction('dashboard');
        } catch (error) {
            console.error("Error signing up:", error);
            if (error.code === 'auth/email-already-in-use') {
                setError('This email is already in use. Please log in or use another email.');
            } else if (error.code === 'auth/invalid-email') {
                setError('Invalid email address. Please check and try again.');
            } else if (error.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters.');
            } else {
                setError(error.message || "An unknown error occurred during signup.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthPageLayout title="Sign Up for SalesOps Pro" theme={theme}>
            <form onSubmit={handleSignup} className="space-y-4">
                <InputField
                    icon={UserRound}
                    label="Full Name"
                    id="fullname-signup"
                    name="fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Full Name"
                    required
                />
                <InputField
                    icon={AtSign}
                    label="Email Address"
                    id="email-signup"
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
                    id="password-signup"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                >
                    {isLoading ? <LoadingSpinner text="" size="sm" /> : 'Create Account'}
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button
                    onClick={() => setCurrentViewFunction('login')}
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    Log in
                </button>
            </p>
        </AuthPageLayout>
    );
};

export default SignupPage;
