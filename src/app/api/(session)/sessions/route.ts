import { NextRequest, NextResponse } from 'next/server';
import authMiddleware from '@/app/api/middlewares/authentication';
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken';

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
        const search = query.searchParams.get("search");

        const response = await prisma.chatSession.findMany({
            include: {
                consultant: true,
                payment: {
                    include: {
                        chats: true,
                    }
                }
            }, where: {
                consultant: {
                    name: {
                        contains: search ?? ''
                    },
                },
                payment: {
                    every: {
                        userId: userId
                    }
                }
            }
        });

        return NextResponse.json(response)
    } catch (error) {
        return NextResponse.json({ title: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}
