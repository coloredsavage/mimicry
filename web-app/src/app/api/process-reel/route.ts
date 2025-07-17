import { NextRequest, NextResponse } from "next/server";
import {
  downloadInstagramReel,
  cleanupFiles,
  getAudioFile,
  getVideoBuffer,
} from "@/lib/download";
import { transcribeAudio, analyzeContent } from "@/lib/openai";

// Store results temporarily (in production, use a database)
const results = new Map();

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Valid Instagram Reel URL is required" },
        { status: 400 }
      );
    }

    // Validate Instagram URL
    if (!url.includes("instagram.com") || !url.includes("reel")) {
      return NextResponse.json(
        { error: "Please provide a valid Instagram Reel URL" },
        { status: 400 }
      );
    }

    console.log("Processing Instagram Reel:", url);

    // Step 1: Download the Instagram Reel
    let downloadResult;
    try {
      downloadResult = await downloadInstagramReel(url);
      console.log("Download completed:", downloadResult.id);
    } catch (error) {
      console.error("Download failed:", error);
      return NextResponse.json(
        {
          error:
            "Failed to download Instagram Reel. Make sure the URL is correct and the reel is public.",
        },
        { status: 500 }
      );
    }

    // Step 2: Transcribe the audio
    let transcript = "";
    try {
      const audioFile = await getAudioFile(downloadResult.audioPath);
      transcript = await transcribeAudio(audioFile);
      console.log("Transcription completed for:", downloadResult.id);
    } catch (error) {
      console.error("Transcription failed:", error);
      await cleanupFiles(downloadResult.id);
      return NextResponse.json(
        {
          error:
            "Failed to transcribe audio. The video might not contain speech.",
        },
        { status: 500 }
      );
    }

    // Step 3: Analyze the content
    let analysis;
    try {
      analysis = await analyzeContent(transcript);
      console.log("Analysis completed for:", downloadResult.id);
    } catch (error) {
      console.error("Analysis failed:", error);
      // Continue with fallback analysis
      analysis = {
        sentiment: { score: 0, label: "neutral", confidence: 0.5 },
        topics: ["General content"],
        keywords: ["instagram", "reel"],
        category: "other",
        summary: "Content analysis unavailable",
      };
    }

    // Step 4: Prepare video for serving (convert to base64 for simplicity)
    let videoBase64 = "";
    try {
      const videoBuffer = await getVideoBuffer(downloadResult.videoPath);
      videoBase64 = `data:video/mp4;base64,${videoBuffer.toString("base64")}`;
    } catch (error) {
      console.error("Failed to prepare video:", error);
    }

    // Store the result
    const result = {
      id: downloadResult.id,
      url,
      title: downloadResult.title,
      transcript,
      analysis,
      videoBase64,
      processedAt: new Date().toISOString(),
    };

    results.set(downloadResult.id, result);

    // Clean up files from disk (we have the data in memory/base64)
    setTimeout(() => {
      cleanupFiles(downloadResult.id);
    }, 1000);

    console.log("Processing completed for:", downloadResult.id);

    return NextResponse.json({
      id: downloadResult.id,
      success: true,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID parameter is required" },
        { status: 400 }
      );
    }

    const result = results.get(id);
    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
