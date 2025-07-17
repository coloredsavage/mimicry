"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please enter a valid Instagram Reel URL");
      return;
    }

    if (!url.includes("instagram.com") || !url.includes("reel")) {
      setError("Please enter a valid Instagram Reel URL");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/process-reel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to process reel");
      }

      const data = await response.json();

      // Redirect to results page with the analysis data
      router.push(`/results?id=${data.id}`);
    } catch (err) {
      setError("Failed to process the reel. Please try again.");
      console.error("Error processing reel:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-white tracking-tight">
            Mimicry
          </h1>
          <p className="text-xl text-gray-400">
            AI-powered Instagram Reel analysis and transcription
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Instagram Reel URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/..."
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                disabled={isLoading}
              />
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="w-full py-3 px-6 bg-white text-black font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Processing..." : "Analyze Reel"}
            </button>
          </form>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <p className="text-gray-300">Processing your reel...</p>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-400">
              <p>• Downloading video content</p>
              <p>• Extracting audio for transcription</p>
              <p>• Analyzing content with AI</p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">
              🎯 Content Analysis
            </h3>
            <p className="text-gray-400">
              AI-powered categorization and topic extraction from your Instagram
              Reels
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">
              📝 Transcription
            </h3>
            <p className="text-gray-400">
              Accurate speech-to-text using OpenAI&apos;s Whisper technology
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">
              😊 Sentiment Analysis
            </h3>
            <p className="text-gray-400">
              Understand the emotional tone and sentiment of the content
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">🔍 Keywords</h3>
            <p className="text-gray-400">
              Extract key topics and important phrases from the transcript
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
