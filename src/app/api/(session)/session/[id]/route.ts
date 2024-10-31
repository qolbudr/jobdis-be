import authMiddleware from "@/app/api/middlewares/authentication";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authResponse = authMiddleware(req)
        if (authResponse.status !== 200) return authResponse
        

        const user = await prisma.chatSession.findFirst({ where: { id: parseInt(params.id) }, include: { consultant: true } })
        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ titile: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}