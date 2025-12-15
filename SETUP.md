# Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the signaling server (in one terminal):**
   ```bash
   npm run server
   ```
   The server will run on `http://localhost:3001`

3. **Start the Next.js client (in another terminal):**
   ```bash
   npm run dev
   ```
   The client will run on `http://localhost:3000`

4. **Open two browser windows:**
   - Go to `http://localhost:3000` in both windows
   - Join the same room ID (or create a new room)
   - Allow camera/microphone permissions
   - Start video calling!

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SIGNALING_URL=http://localhost:3001
```

## Testing with Remote Users

To test with users on different networks, you can use `ngrok`:

1. Install ngrok: `npm install -g ngrok`
2. Expose the signaling server: `ngrok http 3001`
3. Update `NEXT_PUBLIC_SIGNALING_URL` in `.env.local` with the ngrok URL
4. Share the client URL (also exposed via ngrok on port 3000)

## Troubleshooting

- **Camera/Microphone not working:** Ensure you've granted browser permissions
- **Connection issues:** Check that both the server and client are running
- **WebRTC connection fails:** This might be due to firewall/NAT issues. Consider using TURN servers for production.

