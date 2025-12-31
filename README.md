# 🎬 KERA Project Video

> **AI-Powered Video Generation with Remotion**

[![Made with Remotion](https://img.shields.io/badge/Made%20with-Remotion-purple)](https://remotion.dev)
[![Electron](https://img.shields.io/badge/Electron-Desktop%20App-blue)](https://electronjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A desktop application for creating animated videos using AI-generated code. Built with **Electron**, **Next.js**, and **Remotion** - inspired by the amazing work of creators who use Remotion to make programmatic videos on YouTube.

![Preview](https://via.placeholder.com/800x400/1a1a2e/ffffff?text=KERA+Project+Video)

---

## ✨ Features

- 🤖 **AI Code Generation** - Generate Remotion animation code using multiple AI providers:
  - Google Gemini
  - OpenRouter (access to Claude, GPT-4, and more)
  - Anthropic Claude
  - OpenAI GPT-4
  
- 📝 **Monaco Code Editor** - Full-featured code editor with syntax highlighting

- 👁️ **Live Preview** - See your animations in real-time as you code

- 🎥 **Video Export** - Render your animations to MP4 video files

- 🔄 **n8n Integration** - Automate video generation with n8n workflows

- 🛠️ **Auto-Fix** - Automatically corrects common AI code generation errors

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** 
- **npm** or **yarn**
- **FFmpeg** (for video rendering)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/kera-project-video.git
cd kera-project-video

# Install dependencies
npm install

# Install Remotion renderer dependencies
cd remotion-renderer/renderer
npm install
cd ../..

# Start the application
npm run electron:dev
```

---

## 🎮 How to Use

### 1. Configure AI Provider
Go to **Settings** and set up your preferred AI provider:
- Enter your API key (stored locally, never sent to our servers)
- Select the model you want to use

### 2. Generate Animation Code
- Open the **AI Generator** panel
- Describe your animation (e.g., "A bouncing red ball with a shadow")
- Click **Generate** and wait for the AI to create your code

### 3. Preview & Edit
- The generated code appears in the editor
- See live preview on the right panel
- Edit the code manually if needed

### 4. Export Video
- Click the **Rendering** button
- Choose where to save your video
- Wait for the render to complete

---

## 🔧 Configuration

### API Keys

API keys are stored **locally** in your browser's localStorage. They are **never** committed to the repository or sent to external servers (except the AI providers you choose).

### Environment Variables (Optional)

Copy `.env.example` to `.env` for advanced configuration:

```bash
cp .env.example .env
```

---

## ⚠️ Known Issues & Bugs

### Current Limitations

| Issue | Description | Workaround |
|-------|-------------|------------|
| **AI Code Incomplete** | Sometimes AI generates incomplete code with missing brackets | Use simpler, more specific prompts |
| **Rate Limits** | Free tier API keys have usage limits | Wait a few minutes or upgrade your plan |
| **Rendering Errors** | Complex animations may fail to render | Simplify the animation or check for syntax errors |
| **Monaco Focus** | Sometimes the code editor loses focus | Click directly on the editor |

### Tips for Best Results

1. **Be Specific** - Instead of "make a cool animation", say "Create a blue circle that bounces from top to bottom with easing"

2. **Keep it Simple** - Start with simple animations and gradually add complexity

3. **Check the Code** - Always review AI-generated code before rendering

4. **Use Auto-Fix** - The app automatically corrects common typos like `extrapulate` → `extrapolate`

---

## 🏗️ Project Structure

```
├── electron/           # Electron main process
│   ├── main.js         # Main process entry
│   ├── preload.js      # Preload scripts
│   └── ai-service.js   # AI provider integrations
├── src/                # Next.js frontend
│   ├── app/            # App routes
│   ├── components/     # React components
│   ├── lib/            # Utilities
│   └── stores/         # Zustand state management
├── remotion-renderer/  # Remotion compositions
└── public/             # Static assets
```

---

## 🎨 Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Desktop**: Electron
- **Video**: Remotion
- **Editor**: Monaco Editor
- **State**: Zustand
- **AI**: Multiple providers (Gemini, OpenRouter, etc.)

---

## 🙏 Credits & Inspiration

This project was inspired by the amazing creators who use **Remotion** to create programmatic videos on YouTube. Special thanks to:

- **[Fireship](https://www.youtube.com/@Fireship)** - For inspiring fast-paced, code-driven content
- **[Remotion](https://remotion.dev)** - The incredible framework that makes this possible
- **All Remotion YouTubers** - Who showed what's possible with code-generated videos

---

## 📝 License

MIT License - feel free to use this project for your own video creations!

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

---

<p align="center">
  Made with ❤️ and lots of ☕
</p>
