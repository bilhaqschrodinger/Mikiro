"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell, Heart, MessageCircle, Share2, UserPlus } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";

interface Notification {
  id: string;
  type: string;
  read: boolean;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  post: {
    id: string;
    content: string;
  } | null;
}

const typeConfig: Record<string, { icon: typeof Heart; color: string; label: string }> = {
  LIKE: { icon: Heart, color: "text-rose-500", label: "liked your post" },
  COMMENT: { icon: MessageCircle, color: "text-blue-500", label: "commented on your post" },
  SHARE: { icon: Share2, color: "text-green-500", label: "shared your post" },
  FOLLOW: { icon: UserPlus, color: "text-primary", label: "followed you" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setIsLoading(false);
      });

    fetch("/api/notifications", { method: "POST" }).catch(() => {});
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
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Bell size={20} className="text-primary" />
        <h1 className="text-lg font-bold">Notifications</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell size={48} className="mx-auto text-border mb-4" />
          <p className="text-muted">No notifications yet</p>
        </div>
      ) : (
        <div>
          {notifications.map((notification) => {
            const config = typeConfig[notification.type] || typeConfig.LIKE;
            const Icon = config.icon;
            const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            });

            const link = notification.post
              ? `/post/${notification.post.id}`
              : notification.actor
              ? `/profile/${notification.actor.id}`
              : "#";

            return (
              <Link
                key={notification.id}
                href={link}
                className={`flex items-start gap-3 p-4 border-b border-border hover:bg-secondary/50 transition-colors ${
                  !notification.read ? "bg-primary/5" : ""
                }`}
              >
                {notification.actor && (
                  <UserAvatar
                    name={notification.actor.name}
                    image={notification.actor.image}
                    size="sm"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">
                      {notification.actor?.name}
                    </span>{" "}
                    <span className={config.color}>{config.label}</span>
                  </p>
                  {notification.post && (
                    <p className="text-xs text-muted mt-1 line-clamp-1">
                      &ldquo;{notification.post.content}&rdquo;
                    </p>
                  )}
                  <p className="text-[11px] text-muted mt-1">{timeAgo}</p>
                </div>
                <Icon size={14} className={config.color} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
