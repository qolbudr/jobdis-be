import { NextRequest, NextResponse } from 'next/server';
import authMiddleware from '@/app/api/middlewares/authentication';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        // This is a middleware that checks if the user is authenticated
        const authResponse = authMiddleware(req)
        if (authResponse.status !== 200) return authResponse

        const { searchParams } = new URL(req.url);
        const consultantId = searchParams.get("consultantId");
        const sessionId = searchParams.get("sessionId");
        const userId = searchParams.get("userId");

        const payment = await prisma.paymentChat.findMany({
            include: {
                session: {
                    include: {
                        consultant: true
                    }
                },
                user: true
            },
            where: {
                userId: userId ? parseInt(userId) : undefined,
                sessionId: sessionId ? parseInt(sessionId) : undefined,
                session: {
                    consultantId: consultantId ? parseInt(consultantId!) : undefined
                }
            }
        });

        return NextResponse.json(payment)
    } catch (error) {
        return NextResponse.json({ title: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}
