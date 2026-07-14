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

  const { id: postId } = await params;

  const existingLike = await prisma.like.findUnique({
    where: { userId_postId: { userId: session.user.id, postId } },
  });

  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
    return NextResponse.json({ liked: false });
  }

  await prisma.like.create({
    data: { userId: session.user.id, postId },
  });

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (post && post.authorId !== session.user.id) {
    await prisma.notification.create({
      data: {
        type: "LIKE",
        userId: post.authorId,
        actorId: session.user.id,
        postId,
      },
    });
  }

  return NextResponse.json({ liked: true });
}
