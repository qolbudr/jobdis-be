import { NextRequest, NextResponse } from 'next/server';
import authMiddleware from '@/app/api/middlewares/authentication';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        // This is a middleware that checks if the user is authenticated
        const authResponse = authMiddleware(req)
        if (authResponse.status !== 200) return authResponse

        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");
        let payment;

        if (code == "1") {
            payment = await prisma.paymentMapping.update({
                where: { id: parseInt(params.id) }, data: {
                    paid: true
                },
            });
        } else {
            payment = await prisma.paymentMapping.delete({ where: { id: parseInt(params.id) } })
        }

        return NextResponse.json(payment)
    } catch (error) {
        return NextResponse.json({ title: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}
