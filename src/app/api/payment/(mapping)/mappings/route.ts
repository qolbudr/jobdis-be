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
        const userId = searchParams.get("userId");
        const search = searchParams.get("search");

        const payment = await prisma.paymentMapping.findMany({
            include: {
                user: true
            },
            where: {
                userId: userId ? parseInt(userId) : undefined,
                user: {
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
