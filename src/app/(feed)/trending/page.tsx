"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PostCard from "@/components/PostCard";
import { TrendingUp } from "lucide-react";

interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  topic: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count: {
    likes: number;
    comments: number;
    shares: number;
  };
  isLiked?: boolean;
}

export default function TrendingPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts?limit=50")
      .then((r) => r.json())
      .then((data) => {
        const trending = (data.posts || [])
          .sort(
            (a: Post, b: Post) =>
              b._count.likes +
              b._count.comments +
              b._count.shares -
              (a._count.likes + a._count.comments + a._count.shares)
          );
        setPosts(trending);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          <h1 className="text-lg font-bold">Trending</h1>
        </div>
        <p className="text-sm text-muted mt-1">
          Posts with the most engagement right now
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted">No trending posts yet</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={session?.user?.id}
          />
        ))
      )}
    </div>
  );
}
