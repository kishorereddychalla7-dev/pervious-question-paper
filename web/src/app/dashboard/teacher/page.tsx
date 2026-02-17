'use client';
import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { useRouter } from 'next/navigation';

export default function TeacherDashboard() {
    const [papers, setPapers] = useState<any[]>([]);
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchPapers();
    }, []);

    const fetchPapers = async () => {
        try {
            const res = await api.get('/papers?limit=100'); // Fetch up to 100 for now
            setPapers(res.data.data || []); // Handle paginated response
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return router.push('/login');
            const user = JSON.parse(userStr);

            await api.post('/papers/upload', {
                title,
                subject,
                content,
                userId: user.id
            });
            alert('Paper uploaded successfully!');
            fetchPapers();
            setTitle('');
            setSubject('');
            setContent('');
        } catch (err) {
            alert('Upload failed');
        }
    };

    const generateStory = async (paperId: string) => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);

        try {
            alert('Generating story... This might take a moment.');
            const res = await api.post('/stories/generate', { paperId, userId: user.id });
            alert(`Story "${res.data.title}" generated!`);
        } catch (err) {
            alert('Generation failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                    Teacher Dashboard
                </h1>
                <button onClick={() => router.push('/')} className="text-gray-400 hover:text-white">
                    Logout
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4">Upload Question Paper</h2>
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
                        <textarea
                            placeholder="Paste question paper text here..."
                            value={content} onChange={e => setContent(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 rounded-lg h-40 focus:ring-2 focus:ring-pink-500 outline-none" required
                        />
                        <button type="submit" className="w-full py-2 bg-pink-600 hover:bg-pink-700 rounded-lg font-bold">
                            Upload Paper
                        </button>
                    </form>
                </div>

                {/* Papers List */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4">Uploaded Papers</h2>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                        {papers.map((paper) => (
                            <div key={paper._id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold">{paper.title}</h3>
                                    <p className="text-sm text-gray-400">{paper.subject} • {new Date(paper.createdAt).toLocaleDateString()}</p>
                                </div>
                                <button
                                    onClick={() => generateStory(paper._id)}
                                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                                >
                                    Convert to Story
                                </button>
                            </div>
                        ))}
                        {papers.length === 0 && <p className="text-gray-500 text-center">No papers uploaded yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
