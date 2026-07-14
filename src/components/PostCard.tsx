"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import UserAvatar from "./UserAvatar";

interface PostCardProps {
  post: {
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
  };
  currentUserId?: string;
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [shareCount, setShareCount] = useState(post._count.shares);
  const [isLiking, setIsLiking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiking) return;

    setIsLiking(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikeCount((prev) => (data.liked ? prev + 1 : prev - 1));
      }
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSharing) return;

    setIsSharing(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/share`, {
        method: "POST",
      });
      if (res.ok) {
        setShareCount((prev) => prev + 1);
      }
    } catch {
      // already shared or error
    } finally {
      setIsSharing(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this post?")) return;

    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    }
  };

  return (
    <Link
      href={`/post/${post.id}`}
      className="block p-4 border-b border-border hover:bg-secondary/50 transition-colors animate-fade-in"
    >
      <div className="flex gap-3">
        <UserAvatar
          name={post.author.name}
          image={post.author.image}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm truncate">
              {post.author.name}
            </span>
            {post.topic && (
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded-full">
                {post.topic.name}
              </span>
            )}
            <span className="text-xs text-muted">· {timeAgo}</span>
            {currentUserId === post.author.id && (
              <button
                onClick={handleDelete}
                className="ml-auto p-1 rounded text-muted hover:text-danger hover:bg-secondary transition-colors"
              >
                <MoreHorizontal size={14} />
              </button>
            )}
          </div>

          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {post.content}
          </p>

          {post.imageUrl && (
            <div className="mt-3 rounded-lg overflow-hidden border border-border">
              <img
                src={post.imageUrl}
                alt="Post image"
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}

          <div className="flex items-center gap-6 mt-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                liked
                  ? "text-rose-500"
                  : "text-muted hover:text-rose-500"
              }`}
            >
              <Heart
                size={14}
                className={liked ? "fill-current" : ""}
              />
              {likeCount > 0 && likeCount}
            </button>
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <MessageCircle size={14} />
              {post._count.comments > 0 && post._count.comments}
            </span>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors"
            >
              <Share2 size={14} />
              {shareCount > 0 && shareCount}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
