import OpenAI from "openai";

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return openai;
}

export async function transcribeAudio(audioFile: File): Promise<string> {
  try {
    const client = getOpenAIClient();
    const transcription = await client.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
    });

    return transcription.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error("Failed to transcribe audio");
  }
}

export async function analyzeContent(transcript: string): Promise<{
  sentiment: {
    score: number;
    label: string;
    confidence: number;
  };
  topics: string[];
  keywords: string[];
  category: string;
  summary: string;
}> {
  try {
    const client = getOpenAIClient();
    const prompt = `
Analyze the following Instagram Reel transcript and provide a JSON response with the following structure:

{
  "sentiment": {
    "score": number (-1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive),
    "label": string (one of: "very negative", "negative", "neutral", "positive", "very positive"),
    "confidence": number (0 to 1, confidence in the sentiment analysis)
  },
  "topics": [array of main topics discussed, max 5],
  "keywords": [array of important keywords/phrases, max 10],
  "category": string (one of: "entertainment", "education", "lifestyle", "business", "fitness", "food", "travel", "technology", "fashion", "music", "comedy", "other"),
  "summary": string (brief 1-2 sentence summary of the content)
}

Transcript:
"${transcript}"

Respond ONLY with valid JSON, no additional text.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert content analyst. Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    const analysis = JSON.parse(responseContent);

    // Validate the response structure
    if (
      !analysis.sentiment ||
      !analysis.topics ||
      !analysis.keywords ||
      !analysis.category ||
      !analysis.summary
    ) {
      throw new Error("Invalid response structure from OpenAI");
    }

    return analysis;
  } catch (error) {
    console.error("Error analyzing content:", error);

    // Fallback analysis if OpenAI fails
    return {
      sentiment: {
        score: 0,
        label: "neutral",
        confidence: 0.5,
      },
      topics: ["General content"],
      keywords: ["instagram", "reel"],
      category: "other",
      summary: "Content analysis unavailable - OpenAI API error",
    };
  }
}
