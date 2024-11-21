import { NextRequest, NextResponse } from 'next/server';
import authMiddleware from '@/app/api/middlewares/authentication';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import { PrismaClient } from '@prisma/client'
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        // This is a middleware that checks if the user is authenticated
        const authResponse = authMiddleware(req)
        if (authResponse.status !== 200) return authResponse

        const token = req.headers.get("authorization");
        const decoded = jwt.decode(token!) as { [key: string]: any };
        const userId = decoded.id;

        const query = new URL(req.url);
        const sessionId = query.searchParams.get("sessionId");

        const roomId = uuid();

        const paymentChat = await prisma.paymentChat.create({
            data: {
                roomId: roomId,
                sessionId: parseInt(sessionId ?? ''),
                paid: false,
                userId: userId
            }
        });

        return NextResponse.json(paymentChat)
    } catch (error) {
        return NextResponse.json({ title: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}
