"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Image as ImageIcon, X } from "lucide-react";
import UserAvatar from "./UserAvatar";
import type { Session } from "next-auth";

interface Topic {
  id: string;
  name: string;
  slug: string;
}

interface CreatePostFormProps {
  session: Session;
  topics: Topic[];
}

export default function CreatePostForm({ session, topics }: CreatePostFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [topicId, setTopicId] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          imageUrl: imageUrl || undefined,
          topicId: topicId || undefined,
        }),
      });

      if (res.ok) {
        setContent("");
        setImageUrl("");
        setTopicId("");
        setShowImageInput(false);
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = content.length;
  const maxChars = 5000;

  return (
    <form onSubmit={handleSubmit} className="p-4 border-b border-border">
      <div className="flex gap-3">
        <UserAvatar
          name={session.user?.name || "User"}
          image={session.user?.image ?? null}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full resize-none bg-transparent text-foreground placeholder:text-muted outline-none min-h-[80px] text-sm leading-relaxed"
            maxLength={maxChars}
          />

          {showImageInput && (
            <div className="flex items-center gap-2 mt-2 animate-fade-in">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste image URL..."
                className="flex-1 px-3 py-1.5 bg-secondary border border-border rounded-lg text-sm outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => {
                  setShowImageInput(false);
                  setImageUrl("");
                }}
                className="p-1.5 text-muted hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showImageInput
                    ? "text-primary bg-primary/10"
                    : "text-muted hover:bg-secondary hover:text-foreground"
                }`}
              >
                <ImageIcon size={16} />
              </button>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="px-2 py-1 bg-secondary border border-border rounded-lg text-xs text-muted outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="">Topic (optional)</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs ${
                  charCount > maxChars * 0.9
                    ? "text-danger"
                    : "text-muted"
                }`}
              >
                {charCount}/{maxChars}
              </span>
              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={14} />
                {isSubmitting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
