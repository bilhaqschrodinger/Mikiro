"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import PostCard from "@/components/PostCard";
import UserAvatar from "@/components/UserAvatar";

interface UserProfile {
  id: string;
  name: string;
  bio: string | null;
  image: string | null;
  createdAt: string;
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
}

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

export default function ProfilePage() {
  const { data: session } = useSession();
  const params = useParams();
  const userId = params.username as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/posts?limit=50`)
      .then((r) => r.json())
      .then((data) => {
        const userPosts = (data.posts || []).filter(
          (p: Post) => p.author.id === userId
        );
        setPosts(userPosts);
        if (userPosts.length > 0) {
          setProfile({
            id: userPosts[0].author.id,
            name: userPosts[0].author.name,
            bio: null,
            image: userPosts[0].author.image,
            createdAt: new Date().toISOString(),
            _count: {
              posts: userPosts.length,
              followers: 0,
              following: 0,
            },
          });
        }
        setIsLoading(false);
      });
  }, [userId]);

  const handleFollow = async () => {
    const res = await fetch(`/api/users/${userId}/follow`, {
      method: "POST",
    });
    if (res.ok) {
      const data = await res.json();
      setIsFollowing(data.following);
      if (profile) {
        setProfile({
          ...profile,
          _count: {
            ...profile._count,
            followers: data.following
              ? profile._count.followers + 1
              : profile._count.followers - 1,
          },
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-muted">User not found</p>
      </div>
    );
  }

  const isOwnProfile = session?.user?.id === userId;

  return (
    <div>
      <div className="p-4 border-b border-border">
        <div className="flex items-start gap-4">
          <UserAvatar
            name={profile.name}
            image={profile.image}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold">{profile.name}</h1>
              {!isOwnProfile && session?.user && (
                <button
                  onClick={handleFollow}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isFollowing
                      ? "border border-border text-foreground hover:border-danger hover:text-danger"
                      : "bg-primary text-white hover:bg-primary-hover"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>
            {profile.bio && (
              <p className="text-sm text-muted mt-1">{profile.bio}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted">
              <span>
                <strong className="text-foreground">
                  {profile._count.posts}
                </strong>{" "}
                posts
              </span>
              <span>
                <strong className="text-foreground">
                  {profile._count.followers}
                </strong>{" "}
                followers
              </span>
              <span>
                <strong className="text-foreground">
                  {profile._count.following}
                </strong>{" "}
                following
              </span>
            </div>
          </div>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted">No posts yet</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={session?.user?.id}
          />
        ))
      )}
    </div>
  );
}
