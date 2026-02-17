'use client';
import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentDashboard() {
    const [stories, setStories] = useState<any[]>([]); // Should fetch stories, not just papers?
    // Ideally, fetch stories that are generated. For MVP, we might fetch generated stories.
    // Actually, wait. I don't have a route to get all stories yet?
    // GET /api/stories/ (not implemented in stories.js yet, only GET /:id)

    // Let's assume I'll add GET /stories route or just list papers for now?
    // Better: List Stories.

    const router = useRouter();

    useEffect(() => {
        // fetchStories(); // Need to implement this route
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
                    Student Dashboard
                </h1>
                <button onClick={() => router.push('/')} className="text-gray-400 hover:text-white">
                    Logout
                </button>
            </header>

            <div className="space-y-6">
                <section>
                    <h2 className="text-2xl font-bold mb-4">Your Adventures</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="p-6 bg-gray-800 rounded-xl hover:bg-gray-750 transition-colors border border-gray-700">
                            <h3 className="text-xl font-semibold mb-2">The Newton Chronicles</h3>
                            <p className="text-gray-400 mb-4">Master gravity and motion in this physics epic.</p>
                            <Link href="/story/mock-id" className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 inline-block">
                                Continue Story
                            </Link>
                        </div>
                        {/* Map stories here */}
                    </div>
                </section>
            </div>
        </div>
    );
}
