import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q?.trim()) {
    return NextResponse.json({ posts: [], users: [], topics: [] });
  }

  const searchTerm = q.trim();

  const [posts, users, topics] = await Promise.all([
    prisma.post.findMany({
      where: { content: { contains: searchTerm, mode: "insensitive" } },
      include: {
        author: { select: { id: true, name: true, image: true } },
        topic: { select: { id: true, name: true, slug: true } },
        _count: { select: { likes: true, comments: true, shares: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.user.findMany({
      where: { name: { contains: searchTerm, mode: "insensitive" } },
      select: { id: true, name: true, image: true, bio: true },
      take: 10,
    }),
    prisma.topic.findMany({
      where: { name: { contains: searchTerm, mode: "insensitive" } },
      take: 5,
    }),
  ]);

  return NextResponse.json({ posts, users, topics });
}
