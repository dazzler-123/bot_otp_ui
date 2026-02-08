import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

// Get socket URL from API URL or environment variable
const getSocketURL = (): string => {
  // If NEXT_PUBLIC_SOCKET_URL is set, use it
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  
  // Otherwise, derive from API URL (remove /api suffix if present)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const baseUrl = apiUrl.replace(/\/api$/, '');
  return baseUrl;
};

export const connectSocket = (token: string): Socket => {
  const SOCKET_URL = getSocketURL();
  
  if (socket?.connected && socket.io.uri === SOCKET_URL) {
    return socket;
  }

  // Disconnect existing socket if URL changed
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
  });

  socket.on('connect', () => {
    console.log('Socket.io connected to:', SOCKET_URL);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket.io disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.io connection error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};

