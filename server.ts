import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { findMatch, type QueueUser } from "./src/lib/matching";
import { isIpBanned } from "./src/lib/ip-ban";
import { normalizeIp } from "./src/lib/ip";
import { recordMatch, updateQueueStats } from "./src/lib/socket-state";
import { prisma } from "./src/lib/prisma";
import type { Gender } from "@prisma/client";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname: dev ? "localhost" : hostname, port });
const handle = app.getRequestHandler();

const waitingQueue: QueueUser[] = [];
const activePairs = new Map<string, string>();
const socketToUser = new Map<string, QueueUser>();
const socketToIp = new Map<string, string>();

function refreshStats() {
  updateQueueStats(
    waitingQueue.filter((u) => u.mode === "video").length,
    waitingQueue.filter((u) => u.mode === "text").length,
    activePairs.size / 2,
    socketToUser.size
  );
}

function removeFromQueue(socketId: string) {
  const idx = waitingQueue.findIndex((u) => u.socketId === socketId);
  if (idx !== -1) waitingQueue.splice(idx, 1);
  refreshStats();
}

function getPartnerId(socketId: string): string | null {
  return activePairs.get(socketId) || null;
}

function disconnectPair(socketId: string, io: Server) {
  const partnerId = getPartnerId(socketId);
  if (partnerId) {
    activePairs.delete(socketId);
    activePairs.delete(partnerId);
    io.to(partnerId).emit("partner-disconnected");
    refreshStats();
  }
}

function partnerPayload(user: QueueUser) {
  return {
    gender: user.gender,
    region: user.region,
    stato: user.stato,
    age: user.age,
    isRegistered: !!user.userId,
    userId: user.userId,
  };
}

function tryMatch(io: Server, seeker: QueueUser) {
  const match = findMatch(waitingQueue, seeker);
  if (!match) return false;

  removeFromQueue(seeker.socketId);
  removeFromQueue(match.socketId);

  activePairs.set(seeker.socketId, match.socketId);
  activePairs.set(match.socketId, seeker.socketId);

  const isInitiator = seeker.socketId < match.socketId;

  io.to(seeker.socketId).emit("matched", {
    partnerId: match.socketId,
    partner: partnerPayload(match),
    isInitiator,
  });

  io.to(match.socketId).emit("matched", {
    partnerId: seeker.socketId,
    partner: partnerPayload(seeker),
    isInitiator: !isInitiator,
  });

  recordMatch();
  refreshStats();
  return true;
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: { origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000" },
    path: "/api/socket",
  });

  io.on("connection", async (socket) => {
    const ip = normalizeIp(socket.handshake.address || "unknown");
    socketToIp.set(socket.id, ip);

    const ipBan = await isIpBanned(ip);
    if (ipBan.banned) {
      socket.emit("banned", { reason: ipBan.reason, until: ipBan.until });
      socket.disconnect();
      return;
    }

    socket.on("join-queue", async (data: {
      gender: Gender;
      region: string;
      stato: string;
      age?: number;
      userId?: string;
      isAdmin?: boolean;
      adminGenderFilter?: Gender | null;
      detectedGender?: Gender | null;
      preferRegionMatch?: boolean;
      mode: "video" | "text";
    }) => {
      const banCheck = await isIpBanned(ip);
      if (banCheck.banned) {
        socket.emit("banned", { reason: banCheck.reason, until: banCheck.until });
        socket.disconnect();
        return;
      }

      disconnectPair(socket.id, io);
      removeFromQueue(socket.id);

      const user: QueueUser = {
        socketId: socket.id,
        gender: data.gender,
        region: data.region || "Non specificata",
        stato: data.stato || "online",
        age: data.age,
        userId: data.userId,
        isAdmin: data.isAdmin || false,
        adminGenderFilter: data.adminGenderFilter || null,
        detectedGender: data.detectedGender || null,
        preferRegionMatch: data.preferRegionMatch || false,
        mode: data.mode,
      };

      socketToUser.set(socket.id, user);

      if (!tryMatch(io, user)) {
        waitingQueue.push(user);
        socket.emit("waiting");
        refreshStats();
      }
    });

    socket.on("skip", () => {
      disconnectPair(socket.id, io);
      const user = socketToUser.get(socket.id);
      if (user) {
        removeFromQueue(socket.id);
        if (!tryMatch(io, user)) {
          waitingQueue.push(user);
          socket.emit("waiting");
          refreshStats();
        }
      }
    });

    socket.on("stop", () => {
      disconnectPair(socket.id, io);
      removeFromQueue(socket.id);
      socketToUser.delete(socket.id);
      socketToIp.delete(socket.id);
      socket.emit("stopped");
      refreshStats();
    });

    socket.on("webrtc-offer", ({ to, offer }) => {
      io.to(to).emit("webrtc-offer", { from: socket.id, offer });
    });

    socket.on("webrtc-answer", ({ to, answer }) => {
      io.to(to).emit("webrtc-answer", { from: socket.id, answer });
    });

    socket.on("webrtc-ice", ({ to, candidate }) => {
      io.to(to).emit("webrtc-ice", { from: socket.id, candidate });
    });

    socket.on("chat-message", ({ to, message }) => {
      io.to(to).emit("chat-message", { from: socket.id, message, timestamp: Date.now() });
    });

    socket.on("typing", ({ to }) => {
      io.to(to).emit("typing", { from: socket.id });
    });

    socket.on("gender-detected", ({ gender }: { gender: Gender }) => {
      const user = socketToUser.get(socket.id);
      if (user) {
        user.detectedGender = gender;
        socketToUser.set(socket.id, user);
      }
    });

    socket.on("disconnect", () => {
      disconnectPair(socket.id, io);
      removeFromQueue(socket.id);
      socketToUser.delete(socket.id);
      socketToIp.delete(socket.id);
      refreshStats();
    });
  });

  httpServer.listen(port, hostname, () => {
    const displayHost = hostname === "0.0.0.0" ? "localhost" : hostname;
    console.log(`> Ome Ita pronto su http://${displayHost}:${port} (NODE_ENV=${process.env.NODE_ENV || "development"})`);
  });
});
