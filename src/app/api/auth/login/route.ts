import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const { email, password } = await req.json();

  try {
    const user = await prisma.users.findFirst({ where: { email: { contains: email } } });
    if (!user) return NextResponse.json({ title: 'Failed to login', message: 'Invalid email or password', code: 401 }, { status: 401 });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return NextResponse.json({ title: 'Failed to login', message: 'Invalid email or password', code: 401 }, { status: 401 });

    // Generate a JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string);
    return NextResponse.json({ message: 'Login successful', user: user, token }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ title: 'Failed to login', message: 'Internal server error', code: 500 }, { status: 500 });
  }
}
