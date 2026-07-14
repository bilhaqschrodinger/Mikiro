"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hash } from "lucide-react";

interface Topic {
  id: string;
  name: string;
  slug: string;
}

interface TopicFilterProps {
  topics: Topic[];
}

export default function TopicFilter({ topics }: TopicFilterProps) {
  const pathname = usePathname();

  return (
    <div className="p-4">
      <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
        Topics
      </h3>
      <nav className="space-y-0.5">
        <Link
          href="/"
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/"
              ? "bg-primary/10 text-primary"
              : "text-foreground hover:bg-secondary"
          }`}
        >
          <Hash size={14} />
          All
        </Link>
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/topic/${topic.slug}`}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === `/topic/${topic.slug}`
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-secondary"
            }`}
          >
            <Hash size={14} />
            {topic.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
