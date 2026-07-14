import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(topics);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}
