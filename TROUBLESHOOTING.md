# Troubleshooting Guide

## Common Issues and Solutions

### Application Not Loading

1. **Check if servers are running:**
   ```bash
   # Check signaling server (port 3001)
   curl http://localhost:3001
   
   # Check Next.js server (port 3000)
   curl http://localhost:3000
   ```

2. **Restart servers:**
   ```bash
   # Kill existing processes
   pkill -f "next dev"
   pkill -f "node server"
   
   # Start signaling server
   npm run server
   
   # In another terminal, start Next.js
   npm run dev
   ```

### Browser Console Errors

**Check browser console (F12) for errors:**
- `RTCPeerConnection is not defined` - Browser doesn't support WebRTC
- `getUserMedia is not a function` - Browser doesn't support media APIs
- `Socket.io connection failed` - Signaling server not running

### Video/Audio Not Working

1. **Check browser permissions:**
   - Allow camera/microphone access when prompted
   - Check browser settings for site permissions

2. **Check browser compatibility:**
   - Chrome/Edge: Full support
   - Firefox: Full support
   - Safari: May need additional configuration
   - Mobile browsers: Limited support

### Connection Issues

1. **WebRTC connection fails:**
   - Both users must be on the same network OR
   - Use TURN servers for NAT traversal
   - Check firewall settings

2. **Signaling server connection fails:**
   - Verify server is running: `curl http://localhost:3001`
   - Check `NEXT_PUBLIC_SIGNALING_URL` in `.env.local`
   - Check browser console for Socket.io errors

### Drawing/Canvas Not Working

1. **Canvas not responding:**
   - Check browser console for errors
   - Verify canvas element is rendered
   - Check if drawing tool is selected

2. **Strokes not syncing:**
   - Verify WebRTC data channel is open
   - Check browser console for data channel errors
   - Ensure both peers are connected

### Widgets Not Dragging

1. **Check if widget is rendered:**
   - Verify widget exists in store
   - Check browser console for errors

2. **Touch/mouse events:**
   - Verify browser supports pointer events
   - Check for CSS z-index conflicts

### Performance Issues

1. **Slow rendering:**
   - Reduce number of strokes/widgets
   - Check browser performance tab
   - Clear canvas periodically

2. **High memory usage:**
   - Limit stroke history
   - Remove old widgets
   - Clear unused streams

## Debug Mode

Enable debug logging by opening browser console and checking:
- WebRTC connection state
- Data channel status
- Socket.io events
- Store state changes

## Getting Help

1. Check browser console for errors
2. Check server logs for errors
3. Verify both servers are running
4. Test in different browsers
5. Check network connectivity

