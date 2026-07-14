"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import UserAvatar from "./UserAvatar";

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

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  currentUserId?: string;
  onCommentAdded?: () => void;
}

function CommentItem({
  comment,
  postId,
  currentUserId,
  depth = 0,
}: {
  comment: Comment;
  postId: string;
  currentUserId?: string;
  depth?: number;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replies, setReplies] = useState<Comment[]>(comment.replies || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyContent,
          parentCommentId: comment.id,
        }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setReplies((prev) => [...prev, { ...newComment, replies: [] }]);
        setReplyContent("");
        setShowReply(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${depth > 0 ? "ml-8" : ""}`}>
      <div className="flex gap-3 py-3">
        <UserAvatar
          name={comment.author.name}
          image={comment.author.image}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-xs">
              {comment.author.name}
            </span>
            <span className="text-[10px] text-muted">· {timeAgo}</span>
          </div>
          <p className="text-sm leading-relaxed">{comment.content}</p>
          <div className="flex items-center gap-3 mt-1.5">
            {currentUserId && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="text-[11px] text-muted hover:text-primary font-medium transition-colors"
              >
                Reply
              </button>
            )}
            {comment._count && comment._count.replies > 0 && !showReply && (
              <span className="text-[11px] text-muted">
                {comment._count.replies} {comment._count.replies === 1 ? "reply" : "replies"}
              </span>
            )}
          </div>
        </div>
      </div>

      {showReply && (
        <form onSubmit={handleReply} className="ml-10 mb-3 animate-fade-in">
          <div className="flex gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 px-3 py-1.5 bg-secondary border border-border rounded-lg text-sm outline-none focus:border-primary transition-colors"
              autoFocus
            />
            <button
              type="submit"
              disabled={!replyContent.trim() || isSubmitting}
              className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              Reply
            </button>
          </div>
        </form>
      )}

      {replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          postId={postId}
          currentUserId={currentUserId}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export default function CommentSection({
  postId,
  comments,
  currentUserId,
  onCommentAdded,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [allComments, setAllComments] = useState<Comment[]>(comments);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        const comment = await res.json();
        setAllComments((prev) => [{ ...comment, replies: [] }, ...prev]);
        setNewComment("");
        onCommentAdded?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {currentUserId && (
        <form onSubmit={handleSubmit} className="p-4 border-b border-border">
          <div className="flex gap-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "..." : "Reply"}
            </button>
          </div>
        </form>
      )}

      <div className="px-4">
        {allComments.length === 0 ? (
          <p className="text-center text-muted text-sm py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          allComments.map((comment) => (
            <div key={comment.id} className="border-b border-border last:border-b-0">
              <CommentItem
                comment={comment}
                postId={postId}
                currentUserId={currentUserId}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
