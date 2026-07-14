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

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const existingShare = await prisma.share.findFirst({
    where: { userId: session.user.id, postId },
  });

  if (existingShare) {
    return NextResponse.json(
      { error: "Already shared" },
      { status: 409 }
    );
  }

  await prisma.share.create({
    data: { userId: session.user.id, postId },
  });

  if (post.authorId !== session.user.id) {
    await prisma.notification.create({
      data: {
        type: "SHARE",
        userId: post.authorId,
        actorId: session.user.id,
        postId,
      },
    });
  }

  return NextResponse.json({ shared: true });
}
