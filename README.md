# LiVid TV 📺

> **Live Video, Reimagined.**
> A private, peer-to-peer full-screen video calling application with an immersive transparent HUD for chat, drawing, and collaborative screen interaction.


**LiVid TV** removes the clutter of traditional video conferencing tools. Instead of shrinking your video to make room for chat windows or whiteboards, LiVid uses a **transparent overlay system**. It feels like a private Twitch stream where both parties can draw, chat, and interact directly *on* the video feed in real-time.

-----

## 🌟 Key Features

  * **📱 Full-Screen First:** The video feed always occupies 100% of the viewport. No black bars, no sidebars.
  * **💎 Glass UI (HUD):** Chat messages and controls float seamlessly over the video with adjustable opacity/transparency.
  * **✏️ Live Canvas Overlay:**
      * **Draw on Reality:** Annotate directly over the peer's video feed.
      * **Synced Objects:** Drag and drop transparent objects/images that sync positions instantly via P2P data channels.
  * **🔒 Private & P2P:** Built on **WebRTC**. Video and data streams go directly between peers (Peer-to-Peer). No video is stored on any server.
  * **⚡ Low Latency Data:** Mouse movements and drawing strokes are synced via high-performance UDP data channels.

-----

## 🏗️ Architecture

LiVid TV uses a lightweight signaling server to establish the connection, but the heavy lifting (Video + Audio + Drawing Data) happens directly between clients.

```mermaid
sequenceDiagram
    participant UserA as 👤 User A
    participant Signal as 📡 Signaling Server (Socket.io)
    participant UserB as 👤 User B

    Note over UserA, UserB: 1. Connection Establishment
    UserA->>Signal: Join Room (ID: 123)
    UserB->>Signal: Join Room (ID: 123)
    Signal->>UserA: Peer Found
    UserA->>UserB: WebRTC Offer (SDP)
    UserB->>UserA: WebRTC Answer (SDP)
    UserA->>UserB: ICE Candidates

    Note over UserA, UserB: 2. P2P Established (No Server)
    rect rgba(0, 255, 0, 0.1)
        UserA<-->>UserB: 📹 Video Stream (RTP)
        UserA<-->>UserB: 🔊 Audio Stream (RTP)
        UserA<-->>UserB: ✏️ Data Channel (Drawing/Chat Coords)
    end
```

## 🛠️ Tech Stack

  * **Frontend:** React / Next.js (or Flutter for Mobile)
  * **Styling:** Tailwind CSS (for the glassmorphism/transparency effects)
  * **Real-time Logic:** WebRTC API
  * **Signaling:** Node.js + Socket.io
  * **State Management:** Zustand / Redux (for tracking drawn objects)

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

4.  **Start the Client:**

    ```bash
    npm run dev
    ```

5.  Open `localhost:3000` in two different browser windows (or use `ngrok` to test with a friend) to see the P2P connection in action.

-----

## 🎨 UI/UX Concepts

### The Transparent Layer

The core of LiVid is the `z-index` strategy:

1.  **Base Layer (`z-0`):** `<video>` element (The peer's face/stream).
2.  **Canvas Layer (`z-10`):** HTML5 Canvas / SVG layer for drawing paths and rendering objects. Pointer events are captured here.
3.  **HUD Layer (`z-20`):** Chat bubbles (fading out after 5s), Mute/End Call controls.

-----

## 🗺️ Roadmap

  - [ ] **MVP:** Basic P2P Video + Text Chat Overlay.
  - [ ] **Phase 2:** Shared Whiteboard Canvas (Line drawing sync).
  - [ ] **Phase 3:** Draggable Widgets (Gifs, Emojis) on screen.
  - [ ] **Phase 4:** Mobile App (React Native/Flutter).
  - [ ] **Phase 5:** End-to-End Encryption (E2EE) for text/drawings.

-----

## 🤝 Contributing

Contributions are welcome\! Please read the [CONTRIBUTING.md](https://www.google.com/search?q=CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

-----

**Author:** [Mehmet T. AKALIN](https://dv.com.tr/makalin/)
\<br /\>
*Founder @ [Digital Vision](https://dv.com.tr)*
\<br /\>
[](https://x.com/makalin) [](https://github.com/makalin)
