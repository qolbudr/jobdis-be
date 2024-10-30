import { NextRequest, NextResponse } from 'next/server';
import authMiddleware from '@/app/api/middlewares/authentication';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        // Apply the authentication middleware
        const authResponse = await authMiddleware(req)
        if (authResponse.status !== 200) {
            return authResponse
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search");

        const payment = await prisma.chatSession.findMany({
            include: { consultant: true }, where: {
                consultant: {
                    name: {
                        contains: search ?? ''
                    }
                }
            }
        });
        return NextResponse.json(payment)
    } catch (error) {
        return NextResponse.json({ title: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}
