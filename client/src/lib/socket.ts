import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Connects once per session. Auth is via the httpOnly cookie (sent
 * automatically because withCredentials is true) — the server pulls the
 * JWT out of the handshake's Cookie header. See server/src/config/socket.ts.
 */
export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}
