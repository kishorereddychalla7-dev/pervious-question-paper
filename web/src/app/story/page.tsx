'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc, updateDoc, increment, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../utils/firebase";

function StoryContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [story, setStory] = useState<any>(null);
    const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
    const [viewState, setViewState] = useState<'LOADING' | 'INTRO' | 'NARRATIVE' | 'QUESTION' | 'FEEDBACK' | 'RECAP' | 'FINISH'>('LOADING');
    const [selectedOption, setSelectedOption] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (!id) {
            router.push('/dashboard/student');
            return;
        }
        fetchStory();
    }, [id]);

    const fetchStory = async () => {
        if (!id) return;
        try {
            const storyRef = doc(db, "stories", id as string);
            const storyDoc = await getDoc(storyRef);

            if (storyDoc.exists()) {
                setStory(storyDoc.data());
                setViewState('INTRO');
            } else {
                alert('Story not found');
                router.push('/dashboard/student');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to load story');
        }
    };

    const handleStart = () => setViewState('NARRATIVE');

    const handleNext = () => setViewState('QUESTION');

    const handleSubmitAnswer = async () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);

        const currentChapter = story.chapters[currentChapterIndex];
        const correct = selectedOption === currentChapter.question.correctAnswer;

        setIsCorrect(correct);
        if (correct) setScore(prev => prev + 10);

        // Save attempt in Firestore
        try {
            await addDoc(collection(db, "attempts"), {
                userId: user.uid,
                storyId: id,
                chapterIndex: currentChapterIndex,
                chosenAnswer: selectedOption,
                isCorrect: correct,
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.error("Failed to save attempt", e);
        }

        setViewState('FEEDBACK');
    };

    const handleContinue = () => {
        setViewState('RECAP');
        setSelectedOption('');
    };

    const handleNextChapter = async () => {
        if (currentChapterIndex + 1 < story.chapters.length) {
            setCurrentChapterIndex(prev => prev + 1);
            setViewState('NARRATIVE');
        } else {
            // End of story - Update user score in Firestore
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                try {
                    const userRef = doc(db, "users", user.uid);
                    await updateDoc(userRef, {
                        score: increment(score)
                    });
                } catch (e) { console.error("Failed to update total score", e); }
            }
            setViewState('FINISH');
        }
    };

    if (viewState === 'LOADING' || !story) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading Adventure...</div>;

    const currentChapter = story.chapters[currentChapterIndex];
    const question = currentChapter?.question;

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">

            {viewState === 'INTRO' && (
                <div className="max-w-2xl text-center space-y-6 animate-in fade-in duration-700">
                    <h1 className="text-5xl font-bold text-yellow-500">{story.title}</h1>
                    <p className="text-xl text-gray-300 leading-relaxed">{story.intro}</p>
                    <button onClick={handleStart} className="px-8 py-3 bg-pink-600 rounded-full text-xl font-bold hover:bg-pink-700 transition transform hover:scale-105">
                        Begin Journey
                    </button>
                </div>
            )}

            {viewState === 'NARRATIVE' && (
                <div className="max-w-2xl space-y-6 animate-in slide-in-from-right duration-500">
                    <div className="text-lg text-gray-400 uppercase tracking-widest">Chapter {currentChapterIndex + 1}</div>
                    <p className="text-2xl leading-relaxed">{currentChapter.narrative}</p>
                    <button onClick={handleNext} className="w-full py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-700 transition-all active:scale-95">
                        Next
                    </button>
                </div>
            )}

            {viewState === 'QUESTION' && (
                <div className="max-w-xl w-full bg-gray-800 p-8 rounded-xl shadow-2xl space-y-6 animate-in zoom-in duration-300">
                    <div className="bg-gray-900 p-4 rounded border border-gray-700 text-yellow-400 font-mono text-sm">
                        MISSION CHALLENGE
                    </div>
                    <p className="text-xl font-semibold">{question.text}</p>

                    <div className="space-y-3">
                        {question.options.map((opt: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedOption(opt)}
                                className={`w-full p-4 rounded-lg text-left transition-all border-2 ${selectedOption === opt ? 'border-pink-500 bg-pink-500/20' : 'border-gray-600 hover:bg-gray-700'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleSubmitAnswer}
                        disabled={!selectedOption}
                        className="w-full py-3 bg-green-600 disabled:bg-gray-600 rounded-lg font-bold transition-all active:scale-95"
                    >
                        Submit Answer
                    </button>
                </div>
            )}

            {viewState === 'FEEDBACK' && (
                <div className="max-w-xl w-full text-center space-y-6 animate-in fade-in duration-500">
                    <div className={`text-6xl ${isCorrect ? 'text-green-500' : 'text-red-500'} font-bold`}>
                        {isCorrect ? 'SUCCESS!' : 'FAILURE'}
                    </div>
                    <p className="text-xl">{isCorrect ? 'You solved the challenge correctly!' : 'The system rejected your answer.'}</p>

                    <div className="bg-gray-800 p-6 rounded-lg text-left border-l-4 border-blue-500">
                        <h3 className="font-bold text-gray-400 mb-2">Analysis:</h3>
                        <p className="text-gray-200">{question.explanation}</p>
                    </div>

                    <button onClick={handleContinue} className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all active:scale-95">
                        Continue
                    </button>
                </div>
            )}

            {viewState === 'RECAP' && (
                <div className="max-w-2xl text-center space-y-6 animate-in slide-in-from-bottom duration-500">
                    <h2 className="text-3xl font-bold text-blue-400">Chapter Complete</h2>
                    <p className="text-xl leading-relaxed italic">"{currentChapter.recap}"</p>
                    <button onClick={handleNextChapter} className="px-8 py-3 bg-purple-600 rounded-full font-bold hover:bg-purple-700 transition-all active:scale-95 shadow-lg shadow-purple-500/20">
                        {currentChapterIndex + 1 < story.chapters.length ? 'Next Chapter' : 'Complete Mission'}
                    </button>
                </div>
            )}

            {viewState === 'FINISH' && (
                <div className="text-center space-y-8 animate-in zoom-in duration-700">
                    <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500">
                        Mission Accomplished!
                    </h1>
                    <p className="text-2xl text-gray-300">You earned <span className="text-yellow-500 font-bold">{score}</span> story points!</p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => router.push('/dashboard/student')} className="px-8 py-3 bg-pink-600 rounded-full font-bold hover:bg-pink-700 transition-all">
                            Back to Base
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}

export default function StoryPlayer() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black text-white">Initializing Adventure...</div>}>
            <StoryContent />
        </Suspense>
    );
}
