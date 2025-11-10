export interface Video {
  id: string;
  title: string;
  creator: string;
  creatorAvatar: string;
  thumbnail: string;
  duration: string;
  views: string;
  uploadDate: string;
  category: 'short' | 'long';
  videoUrl: string;
  likes?: string;
  description?: string;
}

export interface Creator {
  id: string;
  name: string;
  avatar: string;
  followers: string;
  videos: number;
  bio?: string;
}

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
}
