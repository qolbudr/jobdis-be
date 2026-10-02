import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { ChatSessionStatus } from '@prisma/client'
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { extractDisabilityProfile, extractDisabilityProfileLocally } from '@/lib/ai/disability';

// Reads the request (and, for GET, the Authorization header) → never static.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Explicit allow-list of what the mobile app may send on registration.
 * This is both validation and protection against mass-assignment
 * (e.g. a client trying to POST role: "admin").
 */
const RegisterSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1).max(120).optional(),
    password: z.string().min(8).max(72), // bcrypt truncates beyond 72 bytes
    // Disability complaint from the mobile registration form. Optional so users
    // who do not want to disclose can still register.
    disabilityNote: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const parsed = RegisterSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json(
                { title: 'Invalid input', message: 'Registration data is invalid', code: 400, error: parsed.error.flatten() },
                { status: 400 },
            );
        }

        const { email, name, password, disabilityNote } = parsed.data;
        const hashed = await bcrypt.hash(password, 8);

        const user = await prisma.users.create({
            data: {
                email,
                name,
                password: hashed,
                role: 'user',
                disabilityNote: disabilityNote?.trim() ? disabilityNote.trim() : null,
            },
            // Never return the password hash to the client.
            select: { id: true, email: true, name: true, role: true, disabilityNote: true },
        });

        if (user.role === 'consultant') {
            await prisma.chatSession.create({
                data: {
                    consultantId: user.id,
                    price: 0,
                    status: ChatSessionStatus.online,
                },
            });
        }

        // Best-effort normalization. Registration must NOT fail or block on the AI.
        // If the LLM is unavailable we still persist a deterministic profile so the
        // complaint is never left untagged (which would degrade recommendations).
        if (disabilityNote?.trim()) {
            void extractDisabilityProfile(disabilityNote)
                .catch((error) => {
                    console.error('[register] disability AI tagging failed, using local fallback', error);
                    return extractDisabilityProfileLocally(disabilityNote);
                })
                .then((profile) =>
                    prisma.users.update({
                        where: { id: user.id },
                        data: { disabilityTags: profile },
                    }),
                )
                .catch((error) => console.error('[register] disability tagging persist failed', error));
        }

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ title: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}
