import { create } from 'zustand';

export interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface DrawingStroke {
  id: string;
  points: DrawingPoint[];
  color: string;
  lineWidth: number;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: number;
  from: string;
}

export interface DrawingTool {
  type: 'pen' | 'eraser' | 'rectangle' | 'circle' | 'arrow' | 'text';
  color: string;
  lineWidth: number;
}

export interface CanvasWidget {
  id: string;
  type: 'emoji' | 'image' | 'text';
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  timestamp: number;
  fontSize?: number;
  fontColor?: string;
  imageData?: string; // Base64 or URL for images
  isDragging?: boolean;
}

export interface ConnectionStats {
  bitrate?: number;
  packetsLost?: number;
  jitter?: number;
  rtt?: number;
}

export interface AppState {
  // Connection state
  isConnected: boolean;
  roomId: string | null;
  roomPassword: string | null;
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
  connectionStats: ConnectionStats | null;
  isScreenSharing: boolean;
  isRecording: boolean;
  mediaRecorder: MediaRecorder | null;
  
  // Drawing state
  isDrawing: boolean;
  currentStroke: DrawingStroke | null;
  strokes: DrawingStroke[];
  strokeHistory: DrawingStroke[][]; // For undo/redo
  historyIndex: number;
  drawingTool: DrawingTool;
  
  // Widgets (emojis, images, etc.)
  widgets: CanvasWidget[];
  
  // Chat state
  messages: ChatMessage[];
  chatInput: string;
  
  // File sharing
  sharedFiles: Array<{ id: string; name: string; size: number; data: ArrayBuffer }>;
  
  // UI state
  isMuted: boolean;
  isVideoEnabled: boolean;
  hudOpacity: number;
  showDrawingTools: boolean;
  showSettings: boolean;
  
  // Virtual background
  virtualBackground: string | null; // URL or 'blur' or null
  virtualBackgroundType: 'none' | 'blur' | 'image';
  
  // Actions
  setConnected: (connected: boolean) => void;
  setRoomId: (roomId: string | null) => void;
  setRoomPassword: (password: string | null) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setScreenStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  setPeerConnection: (pc: RTCPeerConnection | null) => void;
  setConnectionStats: (stats: ConnectionStats | null) => void;
  setIsScreenSharing: (sharing: boolean) => void;
  setIsRecording: (recording: boolean) => void;
  setMediaRecorder: (recorder: MediaRecorder | null) => void;
  setIsDrawing: (drawing: boolean) => void;
  setCurrentStroke: (stroke: DrawingStroke | null) => void;
  addStroke: (stroke: DrawingStroke) => void;
  removeStroke: (id: string) => void;
  clearStrokes: () => void;
  undoStroke: () => void;
  redoStroke: () => void;
  setDrawingTool: (tool: Partial<DrawingTool>) => void;
  addWidget: (widget: CanvasWidget) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<CanvasWidget>) => void;
  addMessage: (message: ChatMessage) => void;
  setChatInput: (input: string) => void;
  addSharedFile: (file: { id: string; name: string; size: number; data: ArrayBuffer }) => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  setHudOpacity: (opacity: number) => void;
  setShowDrawingTools: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setVirtualBackground: (background: string | null, type: 'none' | 'blur' | 'image') => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  isConnected: false,
  roomId: null,
  roomPassword: null,
  localStream: null,
  screenStream: null,
  remoteStream: null,
  peerConnection: null,
  connectionStats: null,
  isScreenSharing: false,
  isRecording: false,
  mediaRecorder: null,
  isDrawing: false,
  currentStroke: null,
  strokes: [],
  strokeHistory: [[]],
  historyIndex: 0,
  drawingTool: {
    type: 'pen',
    color: '#ffffff',
    lineWidth: 3,
  },
  widgets: [],
  messages: [],
  chatInput: '',
  sharedFiles: [],
  isMuted: false,
  isVideoEnabled: true,
  hudOpacity: 0.8,
  showDrawingTools: false,
  showSettings: false,
  virtualBackground: null,
  virtualBackgroundType: 'none',
  
  // Actions
  setConnected: (connected) => set({ isConnected: connected }),
  setRoomId: (roomId) => set({ roomId }),
  setRoomPassword: (password) => set({ roomPassword: password }),
  setLocalStream: (stream) => set({ localStream: stream }),
  setScreenStream: (stream) => set({ screenStream: stream }),
  setRemoteStream: (stream) => set({ remoteStream: stream }),
  setPeerConnection: (pc) => set({ peerConnection: pc }),
  setConnectionStats: (stats) => set({ connectionStats: stats }),
  setIsScreenSharing: (sharing) => set({ isScreenSharing: sharing }),
  setIsRecording: (recording) => set({ isRecording: recording }),
  setMediaRecorder: (recorder) => set({ mediaRecorder: recorder }),
  setIsDrawing: (drawing) => set({ isDrawing: drawing }),
  setCurrentStroke: (stroke) => set({ currentStroke: stroke }),
  addStroke: (stroke) => {
    const state = get();
    const newStrokes = [...state.strokes, stroke];
    const newHistory = state.strokeHistory.slice(0, state.historyIndex + 1);
    newHistory.push(newStrokes);
    set({ 
      strokes: newStrokes,
      strokeHistory: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },
  removeStroke: (id) => set((state) => ({ 
    strokes: state.strokes.filter(s => s.id !== id) 
  })),
  clearStrokes: () => {
    const state = get();
    const newHistory = state.strokeHistory.slice(0, state.historyIndex + 1);
    newHistory.push([]);
    set({ 
      strokes: [],
      strokeHistory: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },
  undoStroke: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      set({ 
        strokes: [...state.strokeHistory[newIndex]],
        historyIndex: newIndex,
      });
    }
  },
  redoStroke: () => {
    const state = get();
    if (state.historyIndex < state.strokeHistory.length - 1) {
      const newIndex = state.historyIndex + 1;
      set({ 
        strokes: [...state.strokeHistory[newIndex]],
        historyIndex: newIndex,
      });
    }
  },
  setDrawingTool: (tool) => set((state) => ({ 
    drawingTool: { ...state.drawingTool, ...tool } 
  })),
  addWidget: (widget) => set((state) => ({ 
    widgets: [...state.widgets, widget] 
  })),
  removeWidget: (id) => set((state) => ({ 
    widgets: state.widgets.filter(w => w.id !== id) 
  })),
  updateWidget: (id, updates) => set((state) => ({
    widgets: state.widgets.map(w => w.id === id ? { ...w, ...updates } : w)
  })),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setChatInput: (input) => set({ chatInput: input }),
  addSharedFile: (file) => set((state) => ({ 
    sharedFiles: [...state.sharedFiles, file] 
  })),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleVideo: () => set((state) => ({ isVideoEnabled: !state.isVideoEnabled })),
  setHudOpacity: (opacity) => set({ hudOpacity: opacity }),
  setShowDrawingTools: (show) => set({ showDrawingTools: show }),
  setShowSettings: (show) => set({ showSettings: show }),
  setVirtualBackground: (background, type) => set({ 
    virtualBackground: background, 
    virtualBackgroundType: type 
  }),
}));

