# Mimicry - Instagram Reel Analyzer

AI-powered Instagram Reel analysis with transcription and content insights. Available as both a **command-line tool** and a **modern web application**.

## 🚀 Choose Your Interface

### 📱 Web Application ([/web-app](./web-app))
Modern Next.js web interface with video player and beautiful results display.

### 💻 CLI Tool ([reel_fetcher.py](./reel_fetcher.py))
Original Python command-line tool for batch processing and terminal usage.

---

## 🎯 Features (Both Versions)

- **🎬 Video Download**: Download Instagram Reels (no login required)
- **📝 AI Transcription**: OpenAI Whisper speech-to-text
- **😊 Sentiment Analysis**: Emotional tone analysis with confidence scores
- **🏷️ Content Categorization**: Automatic content classification
- **🔍 Keyword Extraction**: Key topics and important phrases
- **📊 Content Summary**: AI-generated content summaries

---

## 🌐 Web Application

### Quick Start
```bash
cd web-app
npm install
cp env.example .env.local
# Add your OPENAI_API_KEY to .env.local
npm run dev
```

### Features
- 🎥 **Video Player**: Watch reels with playback controls
- 🌙 **Dark Theme**: Sleek black interface
- 📱 **Responsive Design**: Works on all devices
- ⚡ **Real-time Processing**: Live progress indicators
- 🔗 **Direct Results**: Shareable analysis links

[**📚 Full Web App Documentation →**](./web-app/README.md)

---

## 💻 CLI Tool

### Quick Start
```bash
python3 reel_fetcher.py
# Follow the prompts to enter URLs and save location
```

### Features
- 📦 **Batch Processing**: Handle multiple URLs at once
- 📁 **File Management**: Organized output with compiled transcripts
- 🔄 **Progress Tracking**: Visual progress bars
- 📋 **Export Options**: Multiple output formats
- 🛠️ **Automation Ready**: Perfect for scripts and workflows

### Usage Example
```bash
# Interactive mode
python3 reel_fetcher.py

# Enter your Instagram Reel URLs:
> https://www.instagram.com/reel/example1/
> https://www.instagram.com/reel/example2/
> done

# Results saved to your specified folder
```

---

## �� System Requirements

### Prerequisites (Both Versions)
- **Python 3.9+** (for video processing)
- **ffmpeg** (for audio extraction)
- **OpenAI API Key** (for transcription and analysis)

### Install Dependencies
```bash
# Install yt-dlp for Instagram downloads
pip3 install yt-dlp

# Install ffmpeg
# macOS:
brew install ffmpeg
# Ubuntu/Debian:
sudo apt update && sudo apt install ffmpeg
```

### Web App Additional Requirements
- **Node.js 18+**
- **npm or yarn**

---

## 📋 Comparison

| Feature | CLI Tool | Web App |
|---------|----------|---------|
| **Interface** | Terminal | Browser |
| **Batch Processing** | ✅ Multiple URLs | 🚧 Single URL (expandable) |
| **Video Playback** | ❌ | ✅ Built-in player |
| **File Storage** | ✅ Local files | 💾 Temporary (in-memory) |
| **Progress Tracking** | ✅ Progress bars | ✅ Loading animations |
| **Deployment** | ❌ Local only | ✅ Web deployable |
| **Sharing Results** | 📁 File sharing | 🔗 Direct links |
| **Automation** | ✅ Script-friendly | 🌐 API endpoints |

---

## 🚀 Deployment Options

### CLI Tool
- Run locally on any machine with Python
- Integrate into automation scripts
- Perfect for batch processing workflows

### Web App
- **Vercel**: Frontend deployment (limited backend functionality)
- **Railway/Render**: Full-stack with Python support
- **Docker**: Containerized deployment anywhere

---

## 📝 API Reference (Web App)

### Process a Reel
```http
POST /api/process-reel
Content-Type: application/json

{
  "url": "https://www.instagram.com/reel/..."
}
```

### Get Results
```http
GET /api/process-reel?id={analysis-id}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Video Title",
  "transcript": "Full transcript...",
  "analysis": {
    "sentiment": { "score": 0.8, "label": "positive", "confidence": 0.95 },
    "topics": ["topic1", "topic2"],
    "keywords": ["keyword1", "keyword2"],
    "category": "entertainment",
    "summary": "Brief summary..."
  },
  "videoBase64": "data:video/mp4;base64,..."
}
```

---

## ⚠️ Limitations

- **Public Reels Only**: Private/restricted content cannot be accessed
- **Instagram Dependencies**: Relies on Instagram's accessibility
- **OpenAI Costs**: API usage charges apply
- **Processing Time**: Depends on video length and internet speed

---

## 🛠️ Development

### CLI Tool
```bash
# Edit reel_fetcher.py directly
python3 reel_fetcher.py
```

### Web App
```bash
cd web-app
npm run dev      # Development server
npm run build    # Production build
npm run lint     # Code linting
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Credits

- **CLI Tool**: Original Python implementation
- **Web App**: Next.js/TypeScript implementation  
- **AI Services**: OpenAI Whisper & GPT
- **Video Processing**: yt-dlp & ffmpeg
