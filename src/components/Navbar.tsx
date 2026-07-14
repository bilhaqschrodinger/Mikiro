"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home,
  TrendingUp,
  Search,
  Bell,
  LogOut,
  PlusCircle,
} from "lucide-react";
import UserAvatar from "./UserAvatar";
import type { Session } from "next-auth";

interface NavbarProps {
  session: Session | null;
  unreadCount?: number;
}

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/trending", label: "Trending", icon: TrendingUp },
  { href: "/search", label: "Search", icon: Search },
];

export default function Navbar({ session, unreadCount = 0 }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-primary">Mikiro</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === href
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <Link
                href="/"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                <PlusCircle size={16} />
                Post
              </Link>
              <Link
                href="/notifications"
                className="relative p-2 rounded-lg text-muted hover:bg-secondary hover:text-foreground transition-colors"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[10px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
              <UserAvatar
                name={session.user.name || "User"}
                image={session.user.image ?? null}
                size="sm"
                href={`/profile/${session.user.email}`}
              />
              <button
                onClick={() => signOut()}
                className="p-2 rounded-lg text-muted hover:bg-secondary hover:text-foreground transition-colors"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="sm:hidden flex border-t border-border">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
              pathname === href
                ? "text-primary"
                : "text-muted"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
        {session?.user && (
          <Link
            href="/notifications"
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors relative ${
              pathname === "/notifications"
                ? "text-primary"
                : "text-muted"
            }`}
          >
            <span className="relative">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger text-white text-[8px] font-bold min-w-[12px] h-3 rounded-full flex items-center justify-center px-0.5">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </span>
            Alerts
          </Link>
        )}
      </nav>
    </header>
  );
}
