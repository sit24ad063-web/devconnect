import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import type { AppNotification } from "@devconnect/shared";
import { env } from "./env";

let io: SocketIOServer | null = null;

interface AuthedSocket extends Socket {
  userId?: string;
}

/**
 * Auth is cookie-based (httpOnly), so client JS can never read the raw
 * JWT to hand it to the socket handshake directly. The browser still
 * attaches the cookie automatically on the socket.io handshake request
 * (same-origin/credentialed), so we parse it out of the raw Cookie header
 * here. `auth.token` is kept as a fallback for non-browser clients/tests.
 */
function extractTokenFromHandshake(socket: AuthedSocket): string | null {
  const authToken = socket.handshake.auth?.token as string | undefined;
  if (authToken) return authToken;

  const cookieHeader = socket.handshake.headers.cookie;
  if (!cookieHeader) return null;

  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${env.cookieName}=`));

  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

/**
 * Initializes Socket.io on top of the existing HTTP server. Each
 * authenticated client joins a room named after their user id, so
 * emitNotification() can target a single user without tracking socket ids.
 */
export function initSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.use((socket: AuthedSocket, next) => {
    try {
      const token = extractTokenFromHandshake(socket);
      if (!token) return next(new Error("Missing auth token"));
      const payload = jwt.verify(token, env.jwtSecret) as { sub: string };
      socket.userId = payload.sub;
      next();
    } catch (err) {
      next(new Error("Invalid auth token"));
    }
  });

  io.on("connection", (socket: AuthedSocket) => {
    if (socket.userId) {
      socket.join(userRoom(socket.userId));
    }
  });

  return io;
}

function userRoom(userId: string): string {
  return `user:${userId}`;
}

/** Emits a real-time notification event to a single user, if connected. */
export function emitNotification(userId: string, notification: AppNotification): void {
  if (!io) return;
  io.to(userRoom(userId)).emit("notification", notification);
}
