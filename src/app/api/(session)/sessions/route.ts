import { NextRequest, NextResponse } from 'next/server';
import authMiddleware from '@/app/api/middlewares/authentication';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        // This is a middleware that checks if the user is authenticated
        const authResponse = authMiddleware(req)
        if (authResponse.status !== 200) return authResponse

        const query = new URL(req.url);
        const search = query.searchParams.get("search");

        const response = await prisma.chatSession.findMany({
            include: { consultant: true }, where: {
                consultant: {
                    name: {
                        contains: search ?? ''
                    }
                }
            }
        });

        return NextResponse.json(response)
    } catch (error) {
        return NextResponse.json({ title: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}
