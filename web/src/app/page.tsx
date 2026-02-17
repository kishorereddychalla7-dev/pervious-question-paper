import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
      <main className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-pink-600">
          Question Paper <br /> to Story
        </h1>
        <p className="text-lg md:text-2xl text-gray-300 max-w-2xl mb-10">
          Turn boring exams into epic adventures. Upload your question paper and let AI craft a narrative that tests your knowledge in a gamified world.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            className="px-8 py-3 rounded-full bg-pink-600 hover:bg-pink-700 font-semibold text-lg transition-all shadow-lg hover:shadow-pink-500/50"
          >
            Start Learning
          </Link>
          <Link
            href="/signup"
            className="px-8 py-3 rounded-full bg-transparent border-2 border-white/20 hover:bg-white/10 font-semibold text-lg transition-all"
          >
            Sign Up
          </Link>
        </div>
      </main>

      <footer className="absolute bottom-4 w-full text-center text-gray-500 text-sm">
        &copy; 2026 QuestionPaperToStory. All rights reserved.
      </footer>
    </div>
  );
}
