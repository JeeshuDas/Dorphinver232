export interface Video {
  id: string;
  title: string;
  creator: string;
  creatorId: string;
  creatorAvatar: string;
  thumbnail: string;
  views: string;
  uploadDate: string;
  category: 'long';
  videoUrl?: string;
  duration?: number;
  description?: string;
  likes?: number;
  comments?: number;
  watchTime?: number; // Total watch time in seconds
  frameSettings?: {
    mode: 'fit' | 'fill';
    zoom: number;
    positionX: number;
    positionY: number;
  };
  thumbnailFrameSettings?: {
    mode: 'fit' | 'fill';
    zoom: number;
    positionX: number;
    positionY: number;
  };
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  createdAt: string;
  parentId?: string; // For nested comments
  replies?: Comment[]; // Child comments
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