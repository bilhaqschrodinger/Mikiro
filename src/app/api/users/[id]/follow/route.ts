import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: followingId } = await params;

  if (session.user.id === followingId) {
    return NextResponse.json(
      { error: "Cannot follow yourself" },
      { status: 400 }
    );
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId,
      },
    },
  });

  if (existingFollow) {
    await prisma.follow.delete({ where: { id: existingFollow.id } });
    return NextResponse.json({ following: false });
  }

  await prisma.follow.create({
    data: { followerId: session.user.id, followingId },
  });

  await prisma.notification.create({
    data: {
      type: "FOLLOW",
      userId: followingId,
      actorId: session.user.id,
    },
  });

  return NextResponse.json({ following: true });
}
