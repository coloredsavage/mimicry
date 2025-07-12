import os
import subprocess
import sys
import shutil
import threading
import time

# Install pip module if missing
def install_if_missing(module_name, install_cmd):
    try:
        __import__(module_name)
    except ImportError:
        print(f"\n📦 Installing {module_name}...")
        subprocess.run(install_cmd, shell=True, check=True)

# Spinner fallback (optional use)
class Spinner:
    def __init__(self, message="Processing"):
        self.message = message
        self.spinner = ["|", "/", "-", "\\"]
        self.running = False
        self.thread = None

    def start(self):
        self.running = True
        self.thread = threading.Thread(target=self.animate)
        self.thread.start()

    def animate(self):
        i = 0
        while self.running:
            sys.stdout.write(f"\r{self.message} {self.spinner[i % len(self.spinner)]}")
            sys.stdout.flush()
            time.sleep(0.1)
            i += 1
        sys.stdout.write("\r" + " " * (len(self.message) + 4) + "\r")

    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join()

# Download Instagram reels with progress bar
def download_reels(links, output_dir):
    from tqdm import tqdm

    print(f"\n📥 Downloading {len(links)} reels to {output_dir}...")
    os.makedirs(output_dir, exist_ok=True)
    failed = []

    for i, url in enumerate(tqdm(links, desc="Downloading", unit="video")):
        try:
            subprocess.run([
                sys.executable, "-m", "yt_dlp",
                url,
                "-o", os.path.join(output_dir, "%(title)s - %(id)s.%(ext)s")
            ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            failed.append(url)

    if failed:
        with open(os.path.join(output_dir, "failed_links.txt"), "w") as f:
            f.write("\n".join(failed))
        print(f"\n⚠️ Failed to download {len(failed)} videos. Saved to failed_links.txt")

# Transcribe videos with progress bar
def transcribe_videos(folder):
    from tqdm import tqdm

    print(f"\n📝 Transcribing videos in {folder}...")
    transcribed = 0
    skipped = 0

    video_files = [f for f in os.listdir(folder) if f.endswith((".mp4", ".mov", ".mkv", ".webm"))]

    for filename in tqdm(video_files, desc="Transcribing", unit="video"):
        base_name = os.path.splitext(filename)[0]
        transcript_path = os.path.join(folder, f"{base_name}.txt")
        if os.path.exists(transcript_path):
            skipped += 1
            continue

        video_path = os.path.join(folder, filename)
        try:
            subprocess.run([
                sys.executable, "-m", "whisper",
                video_path,
                "--language", "en",
                "--model", "base",
                "--output_format", "txt",
                "--output_dir", folder
            ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            transcribed += 1
        except Exception as e:
            print(f"\n❌ Failed to transcribe {filename}: {e}")
    return transcribed, skipped

# Merge all transcripts into one file
def compile_transcripts(folder):
    print(f"\n📚 Compiling transcripts from {folder}...")
    compiled = ""
    count = 0
    for filename in sorted(os.listdir(folder)):
        if filename.endswith(".txt") and "compiled" not in filename:
            with open(os.path.join(folder, filename), "r", encoding="utf-8") as f:
                compiled += f"\n\n--- {filename} ---\n"
                compiled += f.read()
                count += 1
    output_path = os.path.join(folder, "compiled_transcripts.txt")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(compiled)
    print(f"✅ Compiled {count} transcript(s) into:\n{output_path}")

# Main CLI logic
def main():
    print("🎬 IG Reels Fetcher – No Login Needed\n")

    folder = input("Enter folder to save videos and transcripts: ").strip()
    if not folder:
        print("❌ Folder path is required.")
        return
    os.makedirs(folder, exist_ok=True)

    print("\n📎 Paste your Instagram Reels links (one per line). Type DONE when finished:")
    links = []
    while True:
        url = input("> ").strip()
        if url.lower() == "done":
            break
        elif url.startswith("http"):
            links.append(url)

    if not links:
        print("❌ No valid links provided.")
        return

    # Ensure dependencies
    install_if_missing("yt_dlp", f"{sys.executable} -m pip install yt-dlp")
    install_if_missing("whisper", f"{sys.executable} -m pip install git+https://github.com/openai/whisper.git")
    install_if_missing("tqdm", f"{sys.executable} -m pip install tqdm")

    if shutil.which("ffmpeg") is None:
        print("\n⚠️ ffmpeg is required but not found.")
        print("Install with Homebrew: brew install ffmpeg")
        return

    # Run main pipeline
    download_reels(links, folder)
    transcribed, skipped = transcribe_videos(folder)
    compile_transcripts(folder)

    print(f"\n🎉 Done! {transcribed} new transcripts generated, {skipped} skipped (already exist).")

if __name__ == "__main__":
    main()
