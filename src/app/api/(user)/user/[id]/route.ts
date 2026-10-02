import { NextRequest, NextResponse } from 'next/server';
import authMiddleware from '@/app/api/middlewares/authentication';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { cacheDeleteByPrefix } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { extractDisabilityProfile, extractDisabilityProfileLocally } from '@/lib/ai/disability';

/**
 * Explicit allow-list of updatable fields. The mobile app often sends the whole
 * user object it got back from GET (including read-only `id`, `createdAt`,
 * `updatedAt`, `needsDisabilityProfile`, and `disabilityTags`). Passing that
 * straight to Prisma throws "Unknown argument `id`", and would otherwise allow
 * mass-assignment of `role`. We accept only known, user-editable fields.
 */
const UpdateUserSchema = z
    .object({
        name: z.string().min(1).max(120).optional(),
        email: z.string().email().optional(),
        password: z.string().min(8).max(72).optional(),
        disabilityNote: z.string().max(1000).nullable().optional(),
        // Ignored if present, but tolerated so echoing back GET payloads works.
        id: z.unknown().optional(),
        role: z.unknown().optional(),
        disabilityTags: z.unknown().optional(),
        needsDisabilityProfile: z.unknown().optional(),
        createdAt: z.unknown().optional(),
        updatedAt: z.unknown().optional(),
    })
    .strip();

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        // This is a middleware that checks if the user is authenticated
        const authResponse = authMiddleware(req)
        if (authResponse.status !== 200) return authResponse
        const user = await prisma.users.findFirst({ where: { id: parseInt(params.id) } })

        if(user?.role === 'consultant') {
          await prisma.chatSession.delete({where: { consultantId: parseInt(params.id) }})
        }

        const response = await prisma.users.delete({ where: { id: parseInt(params.id) } })
        return NextResponse.json(response)
    } catch (error) {
        return NextResponse.json({ title: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        // This is a middleware that checks if the user is authenticated
        const authResponse = authMiddleware(req)
        if (authResponse.status !== 200) return authResponse

        const response = await prisma.users.findFirst({ where: { id: parseInt(params.id) } })
        if (!response) {
            return NextResponse.json({ title: 'Not found', message: 'User not found', code: 404 }, { status: 404 });
        }

        // Mirrors GET /api/recommendations so the profile screen can also prompt
        // existing users to complete their disability profile.
        const needsDisabilityProfile =
            response.role === 'user' &&
            !(response.disabilityNote && response.disabilityNote.trim()) &&
            !response.disabilityTags;

        const { password: _password, ...safeUser } = response;
        return NextResponse.json({ ...safeUser, needsDisabilityProfile })
    } catch (error) {
        return NextResponse.json({ title: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        // This is a middleware that checks if the user is authenticated
        const authResponse = authMiddleware(req)
        if (authResponse.status !== 200) return authResponse

        const parsed = UpdateUserSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json(
                { title: 'Invalid input', message: 'Update data is invalid', code: 400, error: parsed.error.flatten() },
                { status: 400 },
            );
        }
        const { id: _id, role: _role, disabilityTags: _tags, needsDisabilityProfile: _needs, createdAt: _c, updatedAt: _u, ...data } = parsed.data;

        // Only fields the caller is allowed to change reach Prisma.
        const update: {
            name?: string;
            email?: string;
            password?: string;
            disabilityNote?: string | null;
        } = {};
        if (data.name !== undefined) update.name = data.name;
        if (data.email !== undefined) update.email = data.email;
        if (data.disabilityNote !== undefined) update.disabilityNote = data.disabilityNote?.trim() ? data.disabilityNote.trim() : null;
        if (data.password) update.password = await bcrypt.hash(data.password, 8);

        const response = await prisma.users.update({ where: { id: parseInt(params.id) }, data: update })

        // If the disability note changed, recompute the normalized profile and
        // drop cached recommendations so the home screen refreshes. Falls back to
        // local extraction if the AI is unavailable so the profile is never left
        // empty (which would keep the onboarding gate closed).
        if (typeof data.disabilityNote === 'string') {
            const note = data.disabilityNote;
            cacheDeleteByPrefix(`rec:user:${params.id}:`);
            void extractDisabilityProfile(note)
                .catch((error) => {
                    console.error('[user:update] disability AI tagging failed, using local fallback', error);
                    return extractDisabilityProfileLocally(note);
                })
                .then((profile) =>
                    prisma.users.update({ where: { id: parseInt(params.id) }, data: { disabilityTags: profile } }),
                )
                .catch((error) => console.error('[user:update] disability tagging persist failed', error));
        }

        const { password: _password, ...safeUser } = response;
        return NextResponse.json(safeUser)
    } catch (error) {
        return NextResponse.json({ title: 'Error', message: 'Internal server error', error }, { status: 500 });
    }
}