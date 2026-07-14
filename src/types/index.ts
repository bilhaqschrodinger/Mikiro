export interface PostWithAuthor {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
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
}

export interface CommentWithAuthor {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  replies?: CommentWithAuthor[];
}

export interface NotificationWithData {
  id: string;
  type: string;
  read: boolean;
  createdAt: Date;
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
