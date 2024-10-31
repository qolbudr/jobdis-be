import { NextRequest, NextResponse } from 'next/server';
import authMiddleware from '@/app/api/middlewares/authentication';
import { PrismaClient } from '@prisma/client'
import { v4 as uuid } from 'uuid';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authResponse = authMiddleware(req)
        if (authResponse.status !== 200) return authResponse

        const token = req.headers.get("authorization");
        const decoded = jwt.decode(token!) as { [key: string]: any };
        const userId = decoded.id;

        const uploadDir = path.join(process.cwd(), 'public/uploads');

        const formData = await req.formData();
        const body = Object.fromEntries(formData);
        const file = (body.file as Blob) || null;


        const buffer = Buffer.from(await file.arrayBuffer());
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

        const roomId = uuid();
        const fileDetail = (body.file as File);
        const extension = fileDetail.name.split('.').pop();
        const newFileName = `${roomId}.${extension}`;

        fs.writeFileSync(path.resolve(uploadDir, newFileName), new Uint8Array(buffer));

        const paymentChat = await prisma.paymentChat.create({
            data: {
                roomId: roomId,
                sessionId: parseInt(params.id),
                paid: false,
                userId: userId,
                paymentProof: newFileName
            }
        });

        return NextResponse.json(paymentChat)
    } catch (error) {
        return NextResponse.json({ title: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}
