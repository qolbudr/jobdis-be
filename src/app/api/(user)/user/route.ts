import { NextRequest, NextResponse } from 'next/server';
import authMiddleware from '@/app/api/middlewares/authentication';
import bcrypt from 'bcrypt';
import { ChatSessionStatus, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        // This is a middleware that checks if the user is authenticated
        const authResponse = authMiddleware(req)
        if (authResponse.status !== 200) return authResponse

        const data = await req.json();
        const password = await bcrypt.hash(data.password, 8);

        const user = await prisma.users.create({
            data: {
                ...data,
                password: password,
            }
        });

        if (user.role == "consultant") {
            await prisma.chatSession.create({
                data: {
                    "consultantId": user.id,
                    "price": 0,
                    "status": ChatSessionStatus.online,
                }
            })
        }

        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ title: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}