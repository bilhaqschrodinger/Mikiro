"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import PostCard from "@/components/PostCard";
import { Hash } from "lucide-react";

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

export default function TopicPage() {
  const { data: session } = useSession();
  const params = useParams();
  const slug = params.slug as string;
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/posts?topic=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setPosts(data.posts || []);
        setIsLoading(false);
      });
  }, [slug]);

  const topicName = slug.charAt(0).toUpperCase() + slug.slice(1);

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
          <Hash size={20} className="text-primary" />
          <h1 className="text-lg font-bold">{topicName}</h1>
        </div>
        <p className="text-sm text-muted mt-1">
          {posts.length} {posts.length === 1 ? "post" : "posts"} in this topic
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted">No posts in this topic yet</p>
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
