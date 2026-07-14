"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Search as SearchIcon } from "lucide-react";
import PostCard from "@/components/PostCard";
import UserAvatar from "@/components/UserAvatar";
import Link from "next/link";

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

interface User {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
}

interface Topic {
  id: string;
  name: string;
  slug: string;
}

export default function SearchPage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    setPosts(data.posts || []);
    setUsers(data.users || []);
    setTopics(data.topics || []);
    setIsSearching(false);
  };

  return (
    <div>
      <div className="p-4 border-b border-border">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts, users, topics..."
              className="w-full pl-9 pr-3 py-2 bg-secondary border border-border rounded-lg text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {isSearching ? "..." : "Search"}
          </button>
        </form>
      </div>

      {isSearching ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : hasSearched ? (
        <div>
          {topics.length > 0 && (
            <div className="p-4 border-b border-border">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/topic/${topic.slug}`}
                    className="px-3 py-1.5 bg-secondary rounded-full text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    #{topic.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {users.length > 0 && (
            <div className="p-4 border-b border-border">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Users
              </h3>
              <div className="space-y-2">
                {users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <UserAvatar
                      name={user.name}
                      image={user.image}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      {user.bio && (
                        <p className="text-xs text-muted line-clamp-1">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {posts.length > 0 && (
            <div>
              <h3 className="px-4 pt-4 text-xs font-semibold text-muted uppercase tracking-wider">
                Posts
              </h3>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={session?.user?.id}
                />
              ))}
            </div>
          )}

          {topics.length === 0 && users.length === 0 && posts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted">No results found for &ldquo;{query}&rdquo;</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20">
          <SearchIcon size={48} className="mx-auto text-border mb-4" />
          <p className="text-muted">Search for posts, users, or topics</p>
        </div>
      )}
    </div>
  );
}
