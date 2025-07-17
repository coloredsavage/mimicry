import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

const execAsync = promisify(exec);

export interface DownloadResult {
  id: string;
  videoPath: string;
  audioPath: string;
  title: string;
}

export async function downloadInstagramReel(
  url: string
): Promise<DownloadResult> {
  const id = uuidv4();
  const tempDir = path.join(process.cwd(), "temp");

  // Ensure temp directory exists
  await fs.mkdir(tempDir, { recursive: true });

  try {
    // Check if yt-dlp is available
    try {
      await execAsync("which yt-dlp");
    } catch {
      // Try to install yt-dlp via pip
      try {
        await execAsync("pip3 install yt-dlp");
      } catch {
        throw new Error("yt-dlp is not available and could not be installed");
      }
    }

    // Check if ffmpeg is available
    try {
      await execAsync("which ffmpeg");
    } catch {
      throw new Error(
        "ffmpeg is not installed. Please install ffmpeg first:\n" +
          'macOS: Install Homebrew (https://brew.sh) then run "brew install ffmpeg"\n' +
          "OR download from: https://ffmpeg.org/download.html"
      );
    }

    // Download the video (remove --max-downloads which causes exit code 101)
    const videoOutputTemplate = path.join(tempDir, `${id}_%(title)s.%(ext)s`);
    const downloadCommand = `yt-dlp "${url}" -o "${videoOutputTemplate}"`;

    console.log("Downloading with command:", downloadCommand);

    try {
      const { stderr } = await execAsync(downloadCommand, { timeout: 60000 });

      if (stderr && !stderr.includes("WARNING")) {
        console.error("Download stderr:", stderr);
      }
    } catch (error: any) {
      // yt-dlp sometimes returns exit code 101 even on success when using certain flags
      // Check if files were actually downloaded successfully
      console.log("yt-dlp process ended with code:", error.code);
      console.log("Checking if files were downloaded...");

      const files = await fs.readdir(tempDir);
      const videoFile = files.find(
        (f) =>
          f.startsWith(id) &&
          (f.endsWith(".mp4") || f.endsWith(".webm") || f.endsWith(".mkv"))
      );

      if (!videoFile) {
        // Actually failed
        throw new Error(`Download failed: ${error.message}`);
      }

      console.log("Files were downloaded successfully despite error code");
    }

    // Find the downloaded file
    const files = await fs.readdir(tempDir);
    const videoFile = files.find(
      (f) =>
        f.startsWith(id) &&
        (f.endsWith(".mp4") || f.endsWith(".webm") || f.endsWith(".mkv"))
    );

    if (!videoFile) {
      throw new Error("Video file not found after download");
    }

    const videoPath = path.join(tempDir, videoFile);
    const audioPath = path.join(tempDir, `${id}_audio.mp3`);

    // Extract audio from video using ffmpeg
    const audioCommand = `ffmpeg -i "${videoPath}" -q:a 0 -map a "${audioPath}" -y`;

    try {
      await execAsync(audioCommand, { timeout: 30000 });
    } catch (error) {
      console.error("Audio extraction failed:", error);
      throw new Error(
        "Failed to extract audio from video. Make sure ffmpeg is installed."
      );
    }

    // Extract title from filename
    const title = videoFile
      .replace(`${id}_`, "")
      .replace(/\.(mp4|webm|mkv)$/, "");

    return {
      id,
      videoPath,
      audioPath,
      title: title || "Instagram Reel",
    };
  } catch (error) {
    console.error("Download error:", error);

    // Clean up on error
    try {
      const files = await fs.readdir(tempDir);
      for (const file of files) {
        if (file.startsWith(id)) {
          await fs.unlink(path.join(tempDir, file));
        }
      }
    } catch (cleanupError) {
      console.error("Cleanup error:", cleanupError);
    }

    throw error;
  }
}

export async function cleanupFiles(id: string): Promise<void> {
  const tempDir = path.join(process.cwd(), "temp");

  try {
    const files = await fs.readdir(tempDir);
    for (const file of files) {
      if (file.startsWith(id)) {
        await fs.unlink(path.join(tempDir, file));
      }
    }
  } catch (error) {
    console.error("Error cleaning up files:", error);
  }
}

export async function getVideoBuffer(videoPath: string): Promise<Buffer> {
  try {
    return await fs.readFile(videoPath);
  } catch (error) {
    console.error("Error reading video file:", error);
    throw new Error("Failed to read video file");
  }
}

export async function getAudioFile(audioPath: string): Promise<File> {
  try {
    const buffer = await fs.readFile(audioPath);
    const blob = new Blob([buffer], { type: "audio/mpeg" });
    return new File([blob], "audio.mp3", { type: "audio/mpeg" });
  } catch (error) {
    console.error("Error creating audio file:", error);
    throw new Error("Failed to create audio file");
  }
}
