// src/pages/SignupPage.js
import React, { useState } from 'react';
import { AtSign, KeyRound } from 'lucide-react';
import { AuthPageLayout } from './AuthPageLayout';
import { InputField } from '../components/InputField';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { auth, db, currentAppId } from '../utils/firebase';
import { TRIAL_DURATION_DAYS } from '../config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, Timestamp, collection, query, limit, getDocs } from 'firebase/firestore';

const SignupPage = ({ setCurrentViewFunction, setError, setSuccess, theme }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password should be at least 6 characters long.");
            return;
        }
        setIsLoading(true);
        try {
            // Check if any user exists to determine if this is the first signup
            const usersCollectionRef = collection(db, `artifacts/${currentAppId}/users`);
            const q = query(usersCollectionRef, limit(1));
            const existingUsersSnapshot = await getDocs(q);
            const isFirstUser = existingUsersSnapshot.empty;

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const trialStartDate = serverTimestamp(); // Firestore server timestamp for start
            const jsTrialEndDate = new Date();
            jsTrialEndDate.setDate(jsTrialEndDate.getDate() + TRIAL_DURATION_DAYS);
            const trialEndDate = Timestamp.fromDate(jsTrialEndDate);

            const userDocRef = doc(db, `artifacts/${currentAppId}/users/${user.uid}`);
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                role: isFirstUser ? 'admin' : 'user',
                createdAt: serverTimestamp(),
                planStatus: 'trial',
                trialStartDate: trialStartDate,
                trialEndDate: trialEndDate,
            });

            setSuccess(`Signup successful! ${isFirstUser ? 'You have been assigned as an Admin. ' : ''}Your ${TRIAL_DURATION_DAYS}-day trial has started. You can now log in.`);
            setCurrentViewFunction('login');
        } catch (error) {
            console.error("Error signing up:", error);
            if (error.code === 'auth/email-already-in-use') {
                setError('This email address is already in use. Please try logging in or use a different email.');
            } else if (error.code === 'auth/weak-password') {
                setError('The password is too weak. Please choose a stronger password.');
            } else {
                setError(error.message || "An unknown error occurred during signup.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthPageLayout title="Create Your Account" theme={theme}>
            <form onSubmit={handleSignup} className="space-y-4">
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
                <InputField
                    icon={KeyRound}
                    label="Confirm Password"
                    id="confirmPassword-signup"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                >
                    {isLoading ? <LoadingSpinner text="" size="sm" /> : `Start ${TRIAL_DURATION_DAYS}-Day Free Trial`}
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
