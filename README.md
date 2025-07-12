# IG Reel Script Fetcher CLI Tool

A command-line tool that downloads Instagram Reels, transcribes their audio, and compiles all transcripts into a single text file.

## Features

- Download multiple Instagram Reels from URLs
- Transcribe audio using OpenAI's Whisper model
- Compile all transcripts into one clean text file
- No login required
- Progress bars for tracking downloads and transcription

## Requirements

- Python 3.9+
- ffmpeg
- macOS or Linux

## Installation

### 1. Install ffmpeg

Using Homebrew (macOS):
```bash
brew install ffmpeg
```

### 2. Clone or download the script

Navigate to your desired directory:
```bash
cd ~/Desktop/ig_fetcher
```

### 3. Install dependencies

Dependencies will be automatically installed on first run:
- `yt-dlp` (for downloading reels)
- `whisper` (for transcription)
- `tqdm` (for progress bars)

## Usage

### 1. Run the tool

```bash
python3 reel_fetcher.py
```

### 2. Choose save location

When prompted, enter the folder path where you want to save videos and transcripts:
```
Enter folder to save videos and transcripts:
> /Users/yourusername/Documents/ig_videos
```

*Note: The folder will be created if it doesn't exist.*

### 3. Add Instagram Reel URLs

Paste your Reel links one per line:
```
> https://www.instagram.com/reel/CzHgPY0yO6b/
> https://www.instagram.com/reel/C5EyWnbPIje/
> done
```

Type `done` when you've added all links.

### 4. Wait for processing

The tool will show progress bars for:
- Downloading reels
- Transcribing audio

```
📥 Downloading 3 reels...
Downloading: 100%|████████████████████| 3/3

📝 Transcribing...
Transcribing: 100%|████████████████████| 3/3
```

### 5. Get your results

Final output location will be displayed:
```
📚 Compiled 3 transcript(s) into:
/Users/yourusername/Documents/ig_videos/compiled_transcripts.txt
```

## Output Structure

Your save folder will contain:
- `Video title - reelID.mp4` (downloaded video files)
- `Video title - reelID.txt` (individual transcripts)
- `compiled_transcripts.txt` (all transcripts combined)
- `failed_links.txt` (any URLs that failed to download)

## Limitations

- Only works with **public Instagram Reels**
- Private or restricted content cannot be downloaded
- Requires stable internet connection
- Processing time depends on video length and quantity

## Troubleshooting

### Common Issues

**"ffmpeg not found"**
- Install ffmpeg using the installation instructions above

**"Failed to download reel"**
- Check if the reel is public
- Verify the URL is correct
- Check your internet connection

**"Python command not found"**
- Make sure Python 3 is installed: `python3 --version`
- On some systems, use `python` instead of `python3`

