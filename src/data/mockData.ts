import { Video, Category, ShortsCategory, UserProfile } from '../types';

export const mockVideos: Video[] = [
  // Long Videos (5)
  { id: '1', title: 'Attack on Titan - Season Finale Review', creator: 'AnimeZone', creatorAvatar: '#FF6B9D', thumbnail: 'https://images.unsplash.com/photo-1668119064420-fb738fb05e32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMGNoYXJhY3RlcnxlbnwxfHx8fDE3NjI0ODQzMDB8MA&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', duration: 845, views: 3200000, likes: 285000, comments: 12500, uploadDate: '2025-11-05', category: 'long' },
  { id: '2', title: 'Live Concert - Summer Music Festival 2025', creator: 'MusicWorld', creatorAvatar: '#FFD93D', thumbnail: 'https://images.unsplash.com/photo-1545538331-78f76ca06830?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBwZXJmb3JtYW5jZXxlbnwxfHx8fDE3NjI0MTM3Njh8MA&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', duration: 1240, views: 2800000, likes: 195000, comments: 8900, uploadDate: '2025-11-03', category: 'long' },
  { id: '3', title: 'Stand-Up Comedy Special - Laugh Till You Cry', creator: 'ComedyClub', creatorAvatar: '#06D6A0', thumbnail: 'https://images.unsplash.com/photo-1610964200986-a59fe203c46d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21lZHklMjBzdGFuZCUyMHVwfGVufDF8fHx8MTc2MjUxODQ0M3ww&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', duration: 2340, views: 4100000, likes: 342000, comments: 15800, uploadDate: '2025-11-01', category: 'long' },
  { id: '4', title: 'Epic Gaming Tournament - Final Match', creator: 'GamerPro', creatorAvatar: '#9D4EDD', thumbnail: 'https://images.unsplash.com/photo-1635372708431-64774de60e20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBlc3BvcnRzfGVufDF8fHx8MTc2MjQ5MjAwMXww&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', duration: 1580, views: 5200000, likes: 428000, comments: 21400, uploadDate: '2025-10-30', category: 'long' },
  { id: '5', title: 'Cooking With Chef - Perfect Ramen Recipe', creator: 'FoodieChannel', creatorAvatar: '#FF8A3D', thumbnail: 'https://images.unsplash.com/photo-1514986888952-8cd320577b68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwZm9vZHxlbnwxfHx8fDE3NjI0NDY1Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', duration: 720, views: 1850000, likes: 142000, comments: 6500, uploadDate: '2025-10-28', category: 'long' },
  
  // Shorts (3)
  { id: '6', title: '🎌 Anime Edit - Demon Slayer', creator: 'AnimeEdits', creatorAvatar: '#7B2CBF', thumbnail: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMGFydHxlbnwxfHx8fDE3NjI0OTMwODN8MA&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', duration: 24, views: 3800000, likes: 312000, comments: 8900, uploadDate: '2025-11-06', category: 'short', shortCategory: 'anime' },
  { id: '7', title: '🎵 DJ Mix - Electronic Beats', creator: 'DJMaster', creatorAvatar: '#F72585', thumbnail: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGRqfGVufDF8fHx8MTc2MjUxODQ0NXww&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', duration: 29, views: 2950000, likes: 241000, comments: 6800, uploadDate: '2025-11-04', category: 'short', shortCategory: 'music' },
  { id: '8', title: '😂 When WiFi Stops Working', creator: 'MemeLord', creatorAvatar: '#560BAD', thumbnail: 'https://images.unsplash.com/photo-1740950024560-3399bda3a098?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdW5ueSUyMG1lbWV8ZW58MXx8fHwxNzYyNTE4NDQ1fDA&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', duration: 18, views: 4200000, likes: 356000, comments: 11200, uploadDate: '2025-11-02', category: 'short', shortCategory: 'comedy' },
];

export const categories: Category[] = [
  {
    id: 'trending',
    name: 'Trending Now',
    videos: mockVideos.filter(v => v.category === 'long'),
  },
];

export const shortsCategories: ShortsCategory[] = [
  {
    id: 'all-shorts',
    name: 'All Shorts',
    shorts: mockVideos.filter(v => v.category === 'short'),
  },
];

export const shortsVideos = mockVideos.filter(v => v.category === 'short');

export const categoryTags = ['Anime', 'Music', 'Comedy', 'Gaming', 'Food'];

export const userProfile: UserProfile = {
  username: 'user_account',
  displayName: 'Your Profile',
  avatar: 'UQ',
  followers: 12500,
  following: 384,
};

// Related videos for a given video
export const getRelatedVideos = (videoId: string): Video[] => {
  return mockVideos.filter(v => v.category === 'long' && v.id !== videoId).slice(0, 3);
};

// User's uploaded videos
export const getUserVideos = (): Video[] => {
  return mockVideos.filter(v => v.category === 'long').slice(0, 3);
};
