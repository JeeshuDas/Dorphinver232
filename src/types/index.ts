export interface Video {
  id: string;
  title: string;
  creator: string;
  creatorAvatar: string;
  thumbnail: string;
  videoUrl?: string;
  duration: number;
  progress?: number;
  uploadDate: string;
  category: 'short' | 'long';
  views: number;
  likes?: number;
  comments?: number;
  shortCategory?: 'comedy' | 'music' | 'dance' | 'educational' | 'lifestyle';
  description?: string;
  creatorId?: string;
}

export interface Category {
  id: string;
  name: string;
  videos: Video[];
}

export interface ShortsCategory {
  id: string;
  name: string;
  shorts: Video[];
}

export interface UserProfile {
  username: string;
  displayName: string;
  avatar: string;
  followers: number;
  following: number;
}
