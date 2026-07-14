import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = 30;

  const comments = await prisma.comment.findMany({
    where: { postId, parentCommentId: null },
    include: {
      author: { select: { id: true, name: true, image: true } },
      replies: {
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { replies: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = comments.length > limit;
  const trimmedComments = hasMore ? comments.slice(0, limit) : comments;

  return NextResponse.json({
    comments: trimmedComments,
    nextCursor: hasMore ? trimmedComments[trimmedComments.length - 1].id : null,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: postId } = await params;
  const { content, parentCommentId } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      authorId: session.user.id,
      postId,
      parentCommentId: parentCommentId || null,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  });

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (post && post.authorId !== session.user.id) {
    await prisma.notification.create({
      data: {
        type: "COMMENT",
        userId: post.authorId,
        actorId: session.user.id,
        postId,
        commentId: comment.id,
      },
    });
  }

  return NextResponse.json(comment, { status: 201 });
}
