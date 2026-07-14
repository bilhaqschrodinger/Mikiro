"use client";

import Link from "next/link";

interface UserAvatarProps {
  name: string;
  image: string | null;
  size?: "sm" | "md" | "lg";
  href?: string;
}

const sizeClasses = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const colors = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-violet-500",
  "bg-pink-500",
  "bg-teal-500",
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function UserAvatar({
  name,
  image,
  size = "md",
  href,
}: UserAvatarProps) {
  const avatar = image ? (
    <img
      src={image}
      alt={name}
      className={`${sizeClasses[size]} rounded-full object-cover`}
    />
  ) : (
    <div
      className={`${sizeClasses[size]} rounded-full ${getColor(name)} text-white flex items-center justify-center font-semibold`}
    >
      {getInitials(name)}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="shrink-0 hover:opacity-80 transition-opacity">
        {avatar}
      </Link>
    );
  }

  return <span className="shrink-0">{avatar}</span>;
}
