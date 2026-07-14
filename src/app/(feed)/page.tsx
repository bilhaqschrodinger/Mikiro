"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import PostCard from "@/components/PostCard";
import CreatePostForm from "@/components/CreatePostForm";

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

interface Topic {
  id: string;
  name: string;
  slug: string;
}

export default function HomePage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPosts = useCallback(async (nextCursor?: string | null) => {
    const url = nextCursor
      ? `/api/posts?cursor=${nextCursor}`
      : "/api/posts";
    const res = await fetch(url);
    const data = await res.json();
    return data;
  }, []);

  useEffect(() => {
    fetchPosts().then((data) => {
      setPosts(data.posts || []);
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
      setIsLoading(false);
    });

    fetch("/api/topics")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTopics(data);
        }
      })
      .catch(() => {});
  }, [fetchPosts]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const data = await fetchPosts(cursor);
    setPosts((prev) => [...prev, ...(data.posts || [])]);
    setCursor(data.nextCursor);
    setHasMore(!!data.nextCursor);
    setIsLoadingMore(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {session?.user && (
        <CreatePostForm
          session={session}
          topics={topics}
        />
      )}

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted text-lg mb-2">No posts yet</p>
          <p className="text-muted text-sm">
            {session?.user
              ? "Be the first to share a thought!"
              : "Log in to start posting."}
          </p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={session?.user?.id}
            />
          ))}
          {hasMore && (
            <div className="p-4 text-center">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="px-6 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
