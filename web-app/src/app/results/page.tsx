"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// Force dynamic rendering to avoid prerendering issues with useSearchParams
export const dynamic = "force-dynamic";

interface AnalysisResult {
  id: string;
  url: string;
  title: string;
  transcript: string;
  analysis: {
    sentiment: {
      score: number;
      label: string;
      confidence: number;
    };
    topics: string[];
    keywords: string[];
    category: string;
    summary: string;
  };
  videoBase64: string;
  processedAt: string;
}

function ResultsContent() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    if (!id) {
      setError("No analysis ID provided");
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/process-reel?id=${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Analysis not found or expired");
          } else {
            setError("Failed to load analysis results");
          }
          return;
        }

        const data = await response.json();
        setResult(data);
      } catch (err) {
        setError("Failed to load analysis results");
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  const getSentimentColor = (label: string) => {
    switch (label) {
      case "very positive":
        return "text-green-400";
      case "positive":
        return "text-green-300";
      case "neutral":
        return "text-gray-400";
      case "negative":
        return "text-red-300";
      case "very negative":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getSentimentEmoji = (label: string) => {
    switch (label) {
      case "very positive":
        return "😄";
      case "positive":
        return "😊";
      case "neutral":
        return "😐";
      case "negative":
        return "😔";
      case "very negative":
        return "😢";
      default:
        return "😐";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-gray-300">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-lg">{error || "No results found"}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Analyze Another Reel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Analysis Results</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-600"
          >
            Analyze Another
          </Link>
        </div>

        {/* Video Player */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">📹 Video</h2>
          <div className="space-y-4">
            <h3 className="text-lg text-gray-300">{result.title}</h3>
            {result.videoBase64 ? (
              <video
                controls
                className="w-full max-w-2xl mx-auto rounded-lg"
                preload="metadata"
              >
                <source src={result.videoBase64} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="text-gray-400 text-center py-8">
                Video preview unavailable
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Sentiment Analysis */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">
              😊 Sentiment Analysis
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {getSentimentEmoji(result.analysis.sentiment.label)}
                </span>
                <div>
                  <p
                    className={`text-lg font-medium ${getSentimentColor(
                      result.analysis.sentiment.label
                    )}`}
                  >
                    {result.analysis.sentiment.label}
                  </p>
                  <p className="text-sm text-gray-400">
                    Score: {result.analysis.sentiment.score.toFixed(2)} |
                    Confidence:{" "}
                    {(result.analysis.sentiment.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    result.analysis.sentiment.score > 0
                      ? "bg-green-500"
                      : result.analysis.sentiment.score < 0
                      ? "bg-red-500"
                      : "bg-gray-500"
                  }`}
                  style={{
                    width: `${
                      Math.abs(result.analysis.sentiment.score) * 50 + 50
                    }%`,
                    marginLeft:
                      result.analysis.sentiment.score < 0
                        ? `${50 + result.analysis.sentiment.score * 50}%`
                        : "0",
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">
              🎯 Category
            </h2>
            <div className="inline-block px-4 py-2 bg-white text-black rounded-full font-medium capitalize">
              {result.analysis.category}
            </div>
          </div>
        </div>

        {/* Topics and Keywords */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">🏷️ Topics</h2>
            <div className="flex flex-wrap gap-2">
              {result.analysis.topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-700 text-gray-200 rounded-full text-sm"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">
              🔍 Keywords
            </h2>
            <div className="flex flex-wrap gap-2">
              {result.analysis.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-600"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">📋 Summary</h2>
          <p className="text-gray-300 leading-relaxed">
            {result.analysis.summary}
          </p>
        </div>

        {/* Transcript */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">
            📝 Transcript
          </h2>
          <div className="bg-black rounded-lg p-4 border border-gray-700">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {result.transcript || "No transcript available"}
            </p>
          </div>
        </div>

        {/* Metadata */}
        <div className="text-center text-gray-400 text-sm">
          <p>
            Analysis completed on{" "}
            {new Date(result.processedAt).toLocaleString()}
          </p>
          <p className="mt-1">Original URL: {result.url}</p>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
