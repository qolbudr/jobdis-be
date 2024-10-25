import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const { email, password } = await req.json();

  try {
    const user = await prisma.users.findFirst({ where: { email: { contains: email } } });

    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string);

    return NextResponse.json({ message: 'Login successful', user: user, token }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error', error }, { status: 500 });
  }
}