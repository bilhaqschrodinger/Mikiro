"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2, ArrowLeft } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import CommentSection from "@/components/CommentSection";

interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
    bio: string | null;
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

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  replies?: Comment[];
  _count?: { replies: number };
}

export default function PostDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${postId}`)
      .then((r) => r.json())
      .then((data) => {
        setPost(data);
        setLiked(data.isLiked || false);
        setLikeCount(data._count?.likes || 0);
        setShareCount(data._count?.shares || 0);
      });

    fetch(`/api/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((data) => {
        setComments(data.comments || []);
        setIsLoading(false);
      });
  }, [postId]);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikeCount((prev) => (data.liked ? prev + 1 : prev - 1));
      }
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    const res = await fetch(`/api/posts/${postId}/share`, { method: "POST" });
    if (res.ok) {
      setShareCount((prev) => prev + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <p className="text-muted">Post not found</p>
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  return (
    <div>
      <div className="p-4 border-b border-border flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-lg text-muted hover:bg-secondary hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold">Post</h1>
      </div>

      <div className="p-4 border-b border-border">
        <div className="flex gap-3">
          <UserAvatar
            name={post.author.name}
            image={post.author.image}
            size="md"
            href={`/profile/${post.author.id}`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/profile/${post.author.id}`}
                className="font-semibold text-sm hover:underline"
              >
                {post.author.name}
              </Link>
              {post.topic && (
                <Link
                  href={`/topic/${post.topic.slug}`}
                  className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded-full hover:bg-primary/20 transition-colors"
                >
                  {post.topic.name}
                </Link>
              )}
              <span className="text-xs text-muted">· {timeAgo}</span>
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

            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  liked ? "text-rose-500" : "text-muted hover:text-rose-500"
                }`}
              >
                <Heart size={16} className={liked ? "fill-current" : ""} />
                {likeCount} {likeCount === 1 ? "like" : "likes"}
              </button>
              <span className="flex items-center gap-1.5 text-sm text-muted">
                <MessageCircle size={16} />
                {post._count.comments}{" "}
                {post._count.comments === 1 ? "comment" : "comments"}
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors"
              >
                <Share2 size={16} />
                {shareCount} {shareCount === 1 ? "share" : "shares"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <CommentSection
        postId={postId}
        comments={comments}
        currentUserId={session?.user?.id}
      />
    </div>
  );
}
