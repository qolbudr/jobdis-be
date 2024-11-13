import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { User } from "@/types/user";
import { PrismaClient } from '@prisma/client'
import * as path from 'path';
import * as fs from 'fs';

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
const prisma = new PrismaClient();

app.prepare().then(() => {
  
  const httpServer = createServer((req, res) => {
    // Handle static files manually (optional)
    const staticFilePath = path.join(__dirname, 'public', req.url || '');
    if (fs.existsSync(staticFilePath) && fs.lstatSync(staticFilePath).isFile()) {
      fs.createReadStream(staticFilePath).pipe(res);
    } else {
      // If the file doesn't exist, fallback to Next.js request handler
      handler(req, res);
    }
  });

  const io = new Server(httpServer);

  io.on('connection', socket => {
    console.log('Client connected');

    socket.on('join', ({ user, roomId }: { user: User, roomId: string }) => {
      socket.join(roomId);
      console.log(`${user?.name} joined room ${roomId}`);

      // Listen for messages from this client
      socket.on('chatMessage', async (msg) => {
        console.log(`Message from ${user?.name}: ${msg}`);
        io.to(roomId).emit('message', { sentBy: user, message: msg, roomId: roomId });
        if (user) await prisma.chat.create({ data: { roomId: roomId, userId: parseInt(user.id), message: msg } })
      });

      // Leave room on disconnect
      socket.on('disconnect', async () => {
        if (user && roomId && user.role == 'user') await prisma.chat.deleteMany({ where: { roomId: roomId } });
        if (user && roomId && user.role == 'user') await prisma.paymentChat.deleteMany({ where: { roomId: roomId } });
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