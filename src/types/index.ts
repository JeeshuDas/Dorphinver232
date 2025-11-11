export interface Video {
  id: string;
  title: string;
  creator: string;
  creatorId: string;
  creatorAvatar: string;
  thumbnail: string;
  views: string;
  uploadDate: string;
  category: 'short' | 'long';
  videoUrl?: string;
  duration?: number;
  shortCategory?: string;
  description?: string;
  likes?: number;
  comments?: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
  followers?: number;
  following?: number;
  isVerified?: boolean;
}