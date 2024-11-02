import authMiddleware from "@/app/api/middlewares/authentication"
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { roomId: string } }) {
    try {
        // This is a middleware that checks if the user is authenticated
        const authResponse = authMiddleware(req)
        if (authResponse.status !== 200) return authResponse

        const response = await prisma.paymentChat.findFirstOrThrow({
            where: {
                roomId: {
                    equals: params.roomId,
                }
            },
            include: {
                chats: {
                    include: {
                        sentBy: true,
                    }
                },
                session: {
                    include: {
                        consultant: true,
                    }
                }
            }
        })

        if (response == null) throw { message: `Chat room with id ${params.roomId} not found` }
        return NextResponse.json(response)
    }
    catch (error) {
        return NextResponse.json({ title: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}