'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../../utils/firebase";

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const router = useRouter();

    const saveUserToFirestore = async (user: any, name: string, role: string) => {
        await setDoc(doc(db, "users", user.uid), {
            name: name || user.displayName,
            email: user.email,
            role: role || 'student',
            score: 0,
            badges: [],
            createdAt: serverTimestamp()
        });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            await saveUserToFirestore(userCredential.user, name, role);
            router.push('/login');
        } catch (err: any) {
            alert(err.message || 'Signup failed');
        }
    };

    const handleGoogleSignup = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await saveUserToFirestore(result.user, result.user.displayName || '', 'student');
            router.push('/dashboard/student');
        } catch (err: any) {
            alert(err.message || 'Google Signup failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center">Create StoryQ Account</h2>
                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 mt-1 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 mt-1 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 mt-1 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">I am a...</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-2 mt-1 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 font-semibold text-white bg-pink-600 rounded-lg hover:bg-pink-700 transition-all"
                    >
                        Sign Up
                    </button>
                </form>

                <div className="relative flex items-center justify-center">
                    <span className="absolute px-3 bg-gray-800 text-gray-500">OR</span>
                    <hr className="w-full border-gray-700" />
                </div>

                <button
                    onClick={handleGoogleSignup}
                    className="w-full py-3 font-semibold text-gray-900 bg-white rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                <p className="text-sm text-center text-gray-400">
                    Already have an account? <Link href="/login" className="text-pink-400 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}
