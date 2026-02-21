'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    orderBy,
    serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../utils/firebase";

export default function TeacherDashboard() {
    const [papers, setPapers] = useState<any[]>([]);
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return router.push('/login');
        const user = JSON.parse(userStr);

        // Real-time listener for papers uploaded by this teacher
        const q = query(
            collection(db, "papers"),
            where("uploadedBy", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const papersList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPapers(papersList);
        });

        return () => unsubscribe();
    }, [router]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return alert("Please select a PDF file");

        setUploading(true);
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);

            // 1. Upload PDF to Storage
            const storageRef = ref(storage, `papers/${user.uid}/${Date.now()}_${file.name}`);
            const uploadResult = await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(uploadResult.ref);

            // 2. Create document in Firestore
            await addDoc(collection(db, "papers"), {
                title,
                subject,
                pdfUrl: downloadUrl,
                pdfPath: storageRef.fullPath,
                uploadedBy: user.uid,
                status: 'pending',
                createdAt: serverTimestamp()
            });

            alert('Paper uploaded! AI processing will start shortly.');
            setTitle('');
            setSubject('');
            setFile(null);
        } catch (err: any) {
            console.error(err);
            alert('Upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const viewStory = (storyId: string) => {
        router.push(`/story/${storyId}`);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                    StoryQ Teacher Dashboard
                </h1>
                <button
                    onClick={() => {
                        localStorage.removeItem('user');
                        router.push('/login');
                    }}
                    className="text-gray-400 hover:text-white"
                >
                    Logout
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-pink-400">Upload New Paper (PDF)</h2>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <input
                            type="text" placeholder="Title (e.g., 10th Grade Physics)"
                            value={title} onChange={e => setTitle(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" required
                        />
                        <input
                            type="text" placeholder="Subject"
                            value={subject} onChange={e => setSubject(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" required
                        />
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-400">Select PDF</label>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-pink-400 hover:file:bg-gray-600"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={uploading}
                            className={`w-full py-2 rounded-lg font-bold transition-all ${uploading ? 'bg-gray-600 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700'}`}
                        >
                            {uploading ? 'Uploading...' : 'Upload & Process'}
                        </button>
                    </form>
                </div>

                {/* Papers List */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-purple-400">Your Papers & Stories</h2>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                        {papers.map((paper) => (
                            <div key={paper.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold">{paper.title}</h3>
                                    <p className="text-sm text-gray-400">{paper.subject} • Status: <span className={paper.status === 'processed' ? 'text-green-400' : 'text-yellow-400'}>{paper.status}</span></p>
                                </div>
                                {paper.status === 'processed' && paper.storyId && (
                                    <button
                                        onClick={() => viewStory(paper.storyId)}
                                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                                    >
                                        View Story
                                    </button>
                                )}
                            </div>
                        ))}
                        {papers.length === 0 && <p className="text-gray-500 text-center">No papers uploaded yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
