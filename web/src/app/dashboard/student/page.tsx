'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    collection,
    query,
    onSnapshot,
    orderBy,
    doc,
    getDoc
} from "firebase/firestore";
import { db } from "../../../utils/firebase";

export default function StudentDashboard() {
    const [stories, setStories] = useState<any[]>([]);
    const [userProfile, setUserProfile] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return router.push('/login');
        const user = JSON.parse(userStr);

        // Fetch User Profile for score/badges
        const fetchProfile = async () => {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                setUserProfile(userDoc.data());
            }
        };
        fetchProfile();

        // Real-time listener for all available stories
        const q = query(
            collection(db, "stories"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const storiesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setStories(storiesList);
        });

        return () => unsubscribe();
    }, [router]);

    const startStory = (storyId: string) => {
        router.push(`/story/${storyId}`);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-pink-500">
                        StoryQ Explorer
                    </h1>
                    <p className="text-gray-400">Welcome back, {userProfile?.name || 'Hero'}!</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-sm text-gray-400">Total Score</div>
                        <div className="text-2xl font-bold text-yellow-500">{userProfile?.score || 0} XP</div>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem('user');
                            router.push('/login');
                        }}
                        className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-all"
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            <main>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-pink-500 rounded-full"></span>
                    Available Missions
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {stories.map((story) => (
                        <div
                            key={story.id}
                            className="group bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-700 hover:border-pink-500 transition-all transform hover:-translate-y-1"
                        >
                            <div className="h-40 bg-gradient-to-br from-purple-900 to-indigo-900 p-6 flex flex-col justify-end">
                                <span className="text-xs font-bold uppercase tracking-widest text-pink-400 mb-2">Adventure Mission</span>
                                <h3 className="text-2xl font-bold">{story.title}</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="text-gray-400 line-clamp-3 text-sm leading-relaxed">
                                    {story.intro}
                                </p>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-xs text-gray-500">{story.chapters?.length || 0} Chapters</span>
                                    <button
                                        onClick={() => startStory(story.id)}
                                        className="px-6 py-2 bg-pink-600 rounded-full font-bold text-sm hover:bg-pink-700 transition-all shadow-lg shadow-pink-500/20"
                                    >
                                        Start Mission
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {stories.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-700">
                            <p className="text-gray-500 text-lg">No active missions available yet. Check back soon!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
