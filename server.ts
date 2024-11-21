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

        try {
          const payment = await prisma.paymentChat.findFirstOrThrow({ include: { session: { include: { consultant: true } }, user: true }, where: { roomId: roomId } });
          const data = {
            "app_id": "2ff1a83f-5ef0-45c7-bbef-e0f3724ae38e",
            "filters": [
              {
                "field": "tag",
                "key": "topic",
                "relation": "=",
                "value": user.role == "user" ? "consultant-" + payment.session.consultant.name : "user-" + payment.user.name,
              }
            ],
            "headings": {
              "en": user.name,
            },
            "contents": {
              "en": msg
            }
          }

          await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'os_v2_app_f7y2qp266bc4po7p4dzxesxdr26qfel72xse6umtqdldo6mnz2bp3czirseqw75vtqhu7txw3phx34d27fj7ro4gyj4x7osa3ctslka'
            },
            body: JSON.stringify(data),
          })
        } catch (error) {
          console.log(error)
        }
      });

      // Leave room on disconnect
      socket.on('disconnect', async () => {
        // if (user && roomId && user.role == 'user') await prisma.chat.deleteMany({ where: { roomId: roomId } });
        // if (user && roomId && user.role == 'user') await prisma.paymentChat.deleteMany({ where: { roomId: roomId } });
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