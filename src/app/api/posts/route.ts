import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const topicSlug = searchParams.get("topic");
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (topicSlug) {
    where.topic = { slug: topicSlug };
  }

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, image: true } },
      topic: { select: { id: true, name: true, slug: true } },
      _count: { select: { likes: true, comments: true, shares: true } },
      likes: session?.user
        ? { where: { userId: session.user.id }, select: { id: true } }
        : false,
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = posts.length > limit;
  const trimmedPosts = hasMore ? posts.slice(0, limit) : posts;

  const postsWithLikeStatus = trimmedPosts.map(
    (post: (typeof trimmedPosts)[number]) => ({
      ...post,
      isLiked: post.likes && post.likes.length > 0,
      likes: undefined,
    })
  );

  return NextResponse.json({
    posts: postsWithLikeStatus,
    nextCursor: hasMore ? trimmedPosts[trimmedPosts.length - 1].id : null,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, imageUrl, topicId } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  const post = await prisma.post.create({
    data: {
      content: content.trim(),
      imageUrl: imageUrl || null,
      authorId: session.user.id,
      topicId: topicId || null,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      topic: { select: { id: true, name: true, slug: true } },
      _count: { select: { likes: true, comments: true, shares: true } },
    },
  });

  return NextResponse.json(post, { status: 201 });
}
