import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { User } from "@/types/user";
import { PrismaClient } from '@prisma/client'

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
const prisma = new PrismaClient();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on('connection', socket => {
    console.log('Client connected');

    socket.on('join', ({ user, roomId }: { user: User, roomId: string }) => {
      socket.join(roomId);
      console.log(`${user?.name} joined room ${roomId}`);

      // Listen for messages from this client
      socket.on('chatMessage', async (msg) => {
        console.log(roomId);
        io.to(roomId).emit('message', { user, msg });
        await prisma.chat.create({ data: { roomId: roomId, userId: parseInt(user.id), message: msg } })
      });

      // Leave room on disconnect
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});