"use client";

import Link from "next/link";
import { TrendingUp, MessageCircle, Heart } from "lucide-react";

interface TrendingPost {
  id: string;
  content: string;
  author: { name: string };
  topic: { name: string; slug: string } | null;
  _count: { likes: number; comments: number; shares: number };
}

interface TrendingSidebarProps {
  posts: TrendingPost[];
}

export default function TrendingSidebar({ posts }: TrendingSidebarProps) {
  if (posts.length === 0) return null;

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={14} className="text-primary" />
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
          Trending Now
        </h3>
      </div>
      <div className="space-y-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="block p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <p className="text-sm line-clamp-2 leading-relaxed mb-2">
              {post.content}
            </p>
            <div className="flex items-center gap-3 text-[11px] text-muted">
              <span className="font-medium truncate">{post.author.name}</span>
              {post.topic && (
                <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                  {post.topic.name}
                </span>
              )}
              <span className="flex items-center gap-0.5">
                <Heart size={10} /> {post._count.likes}
              </span>
              <span className="flex items-center gap-0.5">
                <MessageCircle size={10} /> {post._count.comments}
              </span>
            </div>
          </Link>
        ))}
      </div>
      <Link
        href="/trending"
        className="block mt-3 text-center text-xs text-primary hover:underline"
      >
        See all trending →
      </Link>
    </div>
  );
}
