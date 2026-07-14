"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import TopicFilter from "@/components/TopicFilter";
import TrendingSidebar from "@/components/TrendingSidebar";

interface Topic {
  id: string;
  name: string;
  slug: string;
}

interface TrendingPost {
  id: string;
  content: string;
  author: { name: string };
  topic: { name: string; slug: string } | null;
  _count: { likes: number; comments: number; shares: number };
}

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/posts?limit=3")
      .then((r) => r.json())
      .then((data) => {
        const trending = (data.posts || [])
          .sort(
            (a: TrendingPost, b: TrendingPost) =>
              b._count.likes +
              b._count.comments -
              (a._count.likes + a._count.comments)
          )
          .slice(0, 5);
        setTrendingPosts(trending);
      })
      .catch(() => {});

    fetch("/api/topics")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTopics(data);
        }
      })
      .catch(() => {});

    if (session?.user) {
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((data) => setUnreadCount(data.unreadCount || 0))
        .catch(() => {});
    }
  }, [session]);

  return (
    <div className="min-h-screen">
      <Navbar session={session} unreadCount={unreadCount} />
      <div className="max-w-6xl mx-auto flex">
        {/* Left sidebar - topics */}
        <aside className="hidden lg:block w-56 shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto border-r border-border">
          <TopicFilter topics={topics} />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 border-r border-border max-w-2xl">
          {children}
        </main>

        {/* Right sidebar - trending */}
        <aside className="hidden xl:block w-72 shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
          <TrendingSidebar posts={trendingPosts} />
        </aside>
      </div>
    </div>
  );
}
