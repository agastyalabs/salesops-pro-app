import React, { useState } from 'react';
import { AtSign, KeyRound, UserRound } from 'lucide-react';
import AuthPageLayout from './AuthPageLayout';
import InputField from '../components/InputField';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { auth, db } from '../utils/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";

// Use your actual App ID from Firestore rules here
const appIdString = "1:555072601372:web:af3a40f8d9232012018ed9";

const SignupPage = ({ theme }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [localError, setLocalError] = useState('');
    const [localSuccess, setLocalSuccess] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLocalError('');
        setLocalSuccess('');
        setIsLoading(true);
        // Client-side password check (optional)
        if (password.length < 6) {
            setLocalError('Password must be at least 6 characters.');
            setIsLoading(false);
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (fullName) {
                await updateProfile(userCredential.user, { displayName: fullName });
            }
            await setDoc(
                doc(db, "artifacts", appIdString, "users", userCredential.user.uid),
                {
                    uid: userCredential.user.uid,
                    name: fullName,
                    email: userCredential.user.email,
                    createdAt: serverTimestamp(),
                }
            );
            setLocalSuccess('Account created successfully!');
            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                setLocalError('This email is already in use. Please log in or use another email.');
            } else if (error.code === 'auth/invalid-email') {
                setLocalError('Invalid email address. Please check and try again.');
            } else if (error.code === 'auth/weak-password') {
                setLocalError('Password should be at least 6 characters.');
            } else {
                setLocalError(error.message || "An unknown error occurred during signup.");
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
                {localError && <div className="text-red-600 text-sm">{localError}</div>}
                {localSuccess && <div className="text-green-600 text-sm">{localSuccess}</div>}
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
                    onClick={() => navigate("/login")}
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    Log in
                </button>
            </p>
        </AuthPageLayout>
    );
};

export default SignupPage;
