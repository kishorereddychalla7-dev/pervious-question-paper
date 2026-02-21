'use client';
import { useState } from 'react';
import { doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";

export default function SeedPage() {
    const [status, setStatus] = useState<'IDLE' | 'SEEDING' | 'DONE' | 'ERROR'>('IDLE');
    const [message, setMessage] = useState('');

    const runSeed = async () => {
        setStatus('SEEDING');
        setMessage('Starting seed...');
        try {
            // 1. Sample Teacher
            const teacherId = "sample_teacher_oak";
            await setDoc(doc(db, "users", teacherId), {
                name: "Professor Oak",
                email: "teacher@storyq.com",
                role: "teacher",
                score: 0,
                badges: [],
                createdAt: serverTimestamp()
            });
            setMessage('Teacher created...');

            // 2. Sample Student
            const studentId = "sample_student_ash";
            await setDoc(doc(db, "users", studentId), {
                name: "Ash Ketchum",
                email: "student@storyq.com",
                role: "student",
                score: 120,
                badges: ["Pallet Town Hero"],
                createdAt: serverTimestamp()
            });
            setMessage('Student created...');

            // 3. Sample Paper
            const paperId = "sample_paper_physics";
            await setDoc(doc(db, "papers", paperId), {
                title: "Intro to Newton's Laws",
                subject: "Physics",
                pdfUrl: "https://example.com/mock.pdf",
                uploadedBy: teacherId,
                status: "processed",
                createdAt: serverTimestamp()
            });
            setMessage('Paper created...');

            // 4. Sample Story
            const storyId = "sample_story_motion";
            await setDoc(doc(db, "stories", storyId), {
                paperId: paperId,
                title: "The Gravity Heist",
                intro: "A rogue group of aliens has stolen the Earth's gravity core! To get it back, you must navigate their space station using the very laws of physics they tried to hide.",
                createdBy: teacherId,
                chapters: [
                    {
                        narrative: "You enter the docking bay. The floor is frictionless. A heavy crate block your path. Newton's First Law says it won't move unless you push it.",
                        question: {
                            text: "What property of matter resists changes in motion?",
                            options: ["Inertia", "Gravity", "Weight", "Volume"],
                            correctAnswer: "Inertia",
                            explanation: "Inertia is the tendency of an object to resist changes in its state of motion."
                        },
                        recap: "With a steady burst of your jetpack, you pushed the crate aside. Inertia couldn't stop you!"
                    },
                    {
                        narrative: "The core is in a high-security chamber. You need to launch a probe. F = ma. If the probe is light, it will accelerate faster with the same force.",
                        question: {
                            text: "If force is kept constant and mass increases, what happens to acceleration?",
                            options: ["Increases", "Decreases", "Stays the same", "Doubles"],
                            correctAnswer: "Decreases",
                            explanation: "According to F=ma, acceleration (a) equals force (F) divided by mass (m). If mass increases while force is constant, acceleration must decrease."
                        },
                        recap: "The probe flew through the gap! You're one step closer to saving Earth."
                    }
                ],
                createdAt: serverTimestamp()
            });
            setMessage('Story created...');

            // Link story back to paper
            await updateDoc(doc(db, "papers", paperId), { storyId: storyId });
            setMessage('Seeding complete!');
            setStatus('DONE');
        } catch (err: any) {
            console.error(err);
            setMessage('Error: ' + err.message);
            setStatus('ERROR');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
            <h1 className="text-4xl font-bold mb-4">StoryQ Database Seeder</h1>
            <p className="text-gray-400 mb-8 max-w-md text-center">
                This page will populate your Firestore database with sample users, papers, and stories for testing.
            </p>

            <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md space-y-4">
                <div className="text-sm font-mono bg-black p-4 rounded border border-gray-700 h-24 overflow-y-auto">
                    {message || 'Ready to seed...'}
                </div>

                <button
                    onClick={runSeed}
                    disabled={status === 'SEEDING' || status === 'DONE'}
                    className={`w-full py-3 rounded-lg font-bold transition-all ${status === 'DONE' ? 'bg-green-600' : 'bg-pink-600 hover:bg-pink-700'
                        }`}
                >
                    {status === 'IDLE' && 'Run Seeding'}
                    {status === 'SEEDING' && 'Seeding...'}
                    {status === 'DONE' && 'Database Seeded!'}
                    {status === 'ERROR' && 'Retry Seeding'}
                </button>

                {status === 'DONE' && (
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="w-full py-3 bg-gray-700 rounded-lg font-bold hover:bg-gray-600"
                    >
                        Go to Login
                    </button>
                )}
            </div>

            <p className="mt-8 text-xs text-gray-500">
                Note: Delete this file (`app/seed/page.tsx`) before deploying to production.
            </p>
        </div>
    );
}
