# LiVid TV 📺

> **Live Video, Reimagined.**
> A private, peer-to-peer full-screen video calling application with an immersive transparent HUD for chat, drawing, and collaborative screen interaction.


**LiVid TV** removes the clutter of traditional video conferencing tools. Instead of shrinking your video to make room for chat windows or whiteboards, LiVid uses a **transparent overlay system**. It feels like a private Twitch stream where both parties can draw, chat, and interact directly *on* the video feed in real-time.

-----

## 🌟 Key Features

  * **📱 Full-Screen First:** The video feed always occupies 100% of the viewport. No black bars, no sidebars.
  * **💎 Glass UI (HUD):** Chat messages and controls float seamlessly over the video with adjustable opacity/transparency.
  * **✏️ Advanced Drawing Tools:**
      * **Draw on Reality:** Annotate directly over the peer's video feed with pen, eraser, and text tools.
      * **Rich Color Palette:** 10 preset colors + custom color picker with full RGB support.
      * **Brush Sizes:** 8 preset sizes (1px-20px) with custom slider.
      * **Undo/Redo:** Full drawing history with keyboard shortcuts (Ctrl+Z/Ctrl+Y).
  * **🎯 Draggable Widgets:** Drag text annotations, images, and emoji reactions anywhere on screen with real-time sync.
  * **🖼️ Image Overlay:** Upload and position images on the canvas with drag-and-drop support.
  * **📝 Text Annotations:** Click to add, edit, and position text overlays with customizable fonts and colors.
  * **🎭 Virtual Backgrounds:** Blur effect, preset images, or upload custom backgrounds for professional calls.
  * **🖥️ Screen Sharing:** One-click screen sharing with automatic camera switching.
  * **📹 Recording:** Record video calls locally in high-quality WebM format.
  * **📎 File Sharing:** Share files via P2P data channels with chunked transfer support.
  * **📊 Connection Quality:** Real-time monitoring of bitrate, RTT, jitter, and packet loss.
  * **⌨️ Keyboard Shortcuts:** Power user shortcuts for all major functions.
  * **😊 Emoji Reactions:** Quick reactions with floating animations.
  * **🔒 Private & P2P:** Built on **WebRTC**. Video and data streams go directly between peers (Peer-to-Peer). No video is stored on any server.
  * **⚡ Low Latency Data:** Mouse movements, drawing strokes, and widget positions synced via high-performance UDP data channels.

-----

## 🏗️ Architecture

LiVid TV uses a lightweight signaling server to establish the connection, but the heavy lifting (Video + Audio + Drawing Data) happens directly between clients.

```mermaid
sequenceDiagram
    participant UserA as 👤 User A
    participant Signal as 📡 Signaling Server (Socket.io)
    participant UserB as 👤 User B

    Note over UserA,UserB: 1. Connection Establishment
    UserA->>Signal: Join Room (ID: 123)
    UserB->>Signal: Join Room (ID: 123)
    Signal->>UserA: Peer Found
    UserA->>UserB: WebRTC Offer (SDP)
    UserB->>UserA: WebRTC Answer (SDP)
    UserA->>UserB: ICE Candidates

    Note over UserA,UserB: 2. P2P Established (No Server)
    rect rgba(0, 255, 0, 0.1)
        UserA<-->>UserB: 📹 Video Stream (RTP)
        UserA<-->>UserB: 🔊 Audio Stream (RTP)
        UserA<-->>UserB: ✏️ Data Channel (Drawing/Chat/Widgets)
    end
```

## 🛠️ Tech Stack

  * **Frontend:** React / Next.js with TypeScript
  * **Styling:** Tailwind CSS (glassmorphism/transparency effects)
  * **Animations:** Framer Motion
  * **Real-time Logic:** WebRTC API (Peer-to-Peer connections)
  * **Signaling:** Node.js + Socket.io
  * **State Management:** Zustand (lightweight state management)
  * **Drawing:** HTML5 Canvas API
  * **Media:** MediaRecorder API, getUserMedia, getDisplayMedia

-----

## 🚀 Getting Started

### Prerequisites

  * Node.js (v18+)
  * npm or yarn

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/makalin/livid-tv.git
    cd livid-tv
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Start the Signaling Server:**

    ```bash
    npm run server
    ```
    
    The server will run on `http://localhost:3001`

4.  **Start the Client:**

    ```bash
    npm run dev
    ```
    
    The client will run on `http://localhost:3000`

5.  Open `localhost:3000` in two different browser windows (or use `ngrok` to test with a friend) to see the P2P connection in action.

### Quick Start Guide

1. **Join a Room:** Enter a room ID or leave empty to create a new room
2. **Allow Permissions:** Grant camera and microphone access
3. **Start Drawing:** Click the drawing tools button (✏️) or press `Ctrl+D`
4. **Add Text:** Select text tool, click anywhere to add text
5. **Upload Images:** Click the upload image button (🖼️)
6. **React with Emojis:** Click emoji buttons to add reactions
7. **Share Screen:** Press `Shift+S` or click the screen share button
8. **Record:** Click the record button (🔴) to start recording

For more details, see [SETUP.md](./SETUP.md) and [FEATURES.md](./FEATURES.md).

-----

## 🎨 UI/UX Concepts

### The Transparent Layer

The core of LiVid is the layered `z-index` strategy:

1.  **Base Layer (`z-0`):** `<video>` element (The peer's face/stream).
2.  **Canvas Layer (`z-10`):** HTML5 Canvas for drawing paths, images, and text annotations.
3.  **Widget Layer (`z-15`):** Draggable widgets (text, images, emojis) with real-time positioning.
4.  **HUD Layer (`z-20`):** Chat bubbles, controls, and tool panels with adjustable opacity.
5.  **Modal Layer (`z-30-50`):** Settings, file sharing, and other overlays.

### Design Philosophy

- **Immersive Experience:** Full-screen video with transparent overlays
- **Non-Intrusive:** All UI elements fade or can be hidden
- **Touch-Friendly:** Full mobile and touch device support
- **Keyboard-Driven:** Power users can navigate entirely via keyboard shortcuts

-----

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `M` | Toggle microphone mute |
| `V` | Toggle video on/off |
| `Ctrl+Z` | Undo last drawing stroke |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo drawing stroke |
| `Ctrl+D` | Toggle drawing tools panel |
| `Shift+S` | Toggle screen sharing |
| `Delete` / `Backspace` | Clear canvas |
| `Escape` | Close panels |

-----

## 🗺️ Roadmap

### ✅ Completed Features

  - [x] **MVP:** Basic P2P Video + Text Chat Overlay
  - [x] **Phase 2:** Shared Whiteboard Canvas with drawing sync
  - [x] **Phase 3:** Draggable Widgets (Text, Images, Emojis)
  - [x] **Advanced Drawing:** Pen, eraser, text tool with undo/redo
  - [x] **Screen Sharing:** One-click screen share functionality
  - [x] **Recording:** Local video call recording
  - [x] **File Sharing:** P2P file transfer via data channels
  - [x] **Virtual Backgrounds:** Blur and image backgrounds
  - [x] **Connection Monitoring:** Real-time quality metrics
  - [x] **Keyboard Shortcuts:** Full keyboard navigation support

### 🚀 Upcoming Features

  - [ ] **Phase 4:** Mobile App (React Native/Flutter)
  - [ ] **Phase 5:** End-to-End Encryption (E2EE) for text/drawings
  - [ ] **Advanced Shapes:** Rectangle, circle, arrow tools with fill
  - [ ] **Multi-User:** Support for 3+ peers in a room
  - [ ] **ML Background Removal:** TensorFlow.js/MediaPipe integration
  - [ ] **Cloud Recording:** Optional cloud storage for recordings
  - [ ] **Noise Cancellation:** AI-powered audio enhancement
  - [ ] **Breakout Rooms:** Sub-rooms within main session
  - [ ] **Whiteboard Templates:** Pre-designed templates
  - [ ] **Collaborative Cursors:** See peer's cursor position

-----

## 📚 Documentation

- **[FEATURES.md](./FEATURES.md)** - Complete feature documentation
- **[SETUP.md](./SETUP.md)** - Detailed setup and configuration guide

-----

## 🤝 Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

-----

**Author:** [Mehmet T. AKALIN](https://dv.com.tr/makalin/)
<br />
*Founder @ [Digital Vision](https://dv.com.tr)*
<br />
[Twitter](https://x.com/makalin) | [GitHub](https://github.com/makalin)
