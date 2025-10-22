import { Video, Category, ShortsCategory, UserProfile } from '../types';

export const mockVideos: Video[] = [
  // Most Popular Videos
  { id: '1', title: 'Amazing Sunset Timelapse', creator: 'creator account 1', creatorAvatar: '#FFD93D', thumbnail: '#FFD93D', duration: 245, views: 1200000, likes: 85000, comments: 3200, uploadDate: '2025-10-15', category: 'long' },
  { id: '2', title: 'How to Cook Perfect Pasta', creator: 'creator account 2', creatorAvatar: '#FF8A3D', thumbnail: '#FF8A3D', duration: 180, views: 980000, likes: 72000, comments: 2800, uploadDate: '2025-10-14', category: 'long' },
  { id: '3', title: 'City Lights at Night', creator: 'creator account 3', creatorAvatar: '#6BCB77', thumbnail: '#6BCB77', duration: 320, views: 850000, likes: 68000, comments: 2100, uploadDate: '2025-10-13', category: 'long' },
  { id: '4', title: 'Meditation Guide', creator: 'creator account 4', creatorAvatar: '#4D96FF', thumbnail: '#4D96FF', duration: 600, views: 750000, likes: 61000, comments: 1900, uploadDate: '2025-10-12', category: 'long' },
  
  // Trending
  { id: '5', title: 'Tech Review 2025', creator: 'creator account 5', creatorAvatar: '#9D4EDD', thumbnail: '#9D4EDD', duration: 420, views: 650000, likes: 54000, comments: 1600, uploadDate: '2025-10-11', category: 'long' },
  { id: '6', title: 'Travel Vlog - Tokyo', creator: 'creator account 6', creatorAvatar: '#FF6B9D', thumbnail: '#FF6B9D', duration: 540, views: 580000, likes: 48000, comments: 1400, uploadDate: '2025-10-10', category: 'long' },
  { id: '7', title: 'Workout Routine', creator: 'creator account 7', creatorAvatar: '#06D6A0', thumbnail: '#06D6A0', duration: 300, views: 520000, likes: 42000, comments: 1200, uploadDate: '2025-10-09', category: 'long' },
  { id: '8', title: 'Art Tutorial', creator: 'creator account 8', creatorAvatar: '#FFB627', thumbnail: '#FFB627', duration: 480, views: 480000, likes: 39000, comments: 1100, uploadDate: '2025-10-08', category: 'long' },
  
  // Comedy
  { id: '9', title: 'Funny Fails Compilation', creator: 'creator account 9', creatorAvatar: '#FF5A5F', thumbnail: '#FF5A5F', duration: 360, views: 1500000, likes: 125000, comments: 4200, uploadDate: '2025-10-07', category: 'long' },
  { id: '10', title: 'Stand Up Comedy', creator: 'creator account 10', creatorAvatar: '#FFD93D', thumbnail: '#FFD93D', duration: 420, views: 1200000, likes: 98000, comments: 3600, uploadDate: '2025-10-06', category: 'long' },
  { id: '11', title: 'Pet Bloopers', creator: 'creator account 11', creatorAvatar: '#6BCB77', thumbnail: '#6BCB77', duration: 280, views: 980000, likes: 82000, comments: 2900, uploadDate: '2025-10-05', category: 'long' },
  
  // Continue Watching
  { id: '12', title: 'Documentary Series Ep 1', creator: 'creator account 12', creatorAvatar: '#4D96FF', thumbnail: '#4D96FF', duration: 720, progress: 0.35, views: 450000, likes: 36000, comments: 980, uploadDate: '2025-10-04', category: 'long' },
  { id: '13', title: 'Cooking Masterclass', creator: 'creator account 13', creatorAvatar: '#9D4EDD', thumbnail: '#9D4EDD', duration: 540, progress: 0.62, views: 380000, likes: 31000, comments: 850, uploadDate: '2025-10-03', category: 'long' },
  { id: '14', title: 'Music Production Tutorial', creator: 'creator account 14', creatorAvatar: '#FF6B9D', thumbnail: '#FF6B9D', duration: 900, progress: 0.18, views: 320000, likes: 27000, comments: 720, uploadDate: '2025-10-02', category: 'long' },
  
  // Motivation
  { id: '15', title: 'Morning Motivation', creator: 'creator account 15', creatorAvatar: '#06D6A0', thumbnail: '#06D6A0', duration: 180, views: 890000, likes: 74000, comments: 2600, uploadDate: '2025-10-01', category: 'long' },
  { id: '16', title: 'Success Stories', creator: 'creator account 16', creatorAvatar: '#FFB627', thumbnail: '#FFB627', duration: 480, views: 720000, likes: 59000, comments: 2100, uploadDate: '2025-09-30', category: 'long' },
  
  // Comedy Shorts
  { id: '17', title: 'Epic Fail 😂', creator: 'creator account 1', creatorAvatar: '#7B2CBF', thumbnail: '#7B2CBF', duration: 15, views: 2300000, likes: 189000, comments: 5200, uploadDate: '2025-10-15', category: 'short', shortCategory: 'comedy' },
  { id: '18', title: 'Meme Compilation', creator: 'creator account 2', creatorAvatar: '#9D4EDD', thumbnail: '#9D4EDD', duration: 30, views: 1900000, likes: 156000, comments: 4100, uploadDate: '2025-10-14', category: 'short', shortCategory: 'comedy' },
  { id: '19', title: 'Funny Moment', creator: 'creator account 3', creatorAvatar: '#C77DFF', thumbnail: '#C77DFF', duration: 20, views: 1600000, likes: 132000, comments: 3600, uploadDate: '2025-10-13', category: 'short', shortCategory: 'comedy' },
  { id: '20', title: 'Prank Gone Wrong', creator: 'creator account 4', creatorAvatar: '#E0AAFF', thumbnail: '#E0AAFF', duration: 25, views: 1400000, likes: 115000, comments: 3100, uploadDate: '2025-10-12', category: 'short', shortCategory: 'comedy' },
  { id: '21', title: 'LOL Reaction', creator: 'creator account 5', creatorAvatar: '#7B2CBF', thumbnail: '#7B2CBF', duration: 18, views: 1200000, likes: 98000, comments: 2800, uploadDate: '2025-10-11', category: 'short', shortCategory: 'comedy' },
  { id: '22', title: 'Comedy Skit', creator: 'creator account 6', creatorAvatar: '#9D4EDD', thumbnail: '#9D4EDD', duration: 22, views: 1100000, likes: 91000, comments: 2500, uploadDate: '2025-10-10', category: 'short', shortCategory: 'comedy' },
  
  // Music Shorts
  { id: '23', title: '🎵 New Beat Drop', creator: 'Music Creator 1', creatorAvatar: '#FF6B9D', thumbnail: '#FF6B9D', duration: 28, views: 1850000, likes: 152000, comments: 3900, uploadDate: '2025-10-14', category: 'short', shortCategory: 'music' },
  { id: '24', title: 'Cover Song Magic', creator: 'Music Creator 2', creatorAvatar: '#FF8A3D', thumbnail: '#FF8A3D', duration: 32, views: 1620000, likes: 134000, comments: 3400, uploadDate: '2025-10-13', category: 'short', shortCategory: 'music' },
  { id: '25', title: 'Guitar Riff 🎸', creator: 'Music Creator 3', creatorAvatar: '#FFD93D', thumbnail: '#FFD93D', duration: 19, views: 1450000, likes: 119000, comments: 3000, uploadDate: '2025-10-12', category: 'short', shortCategory: 'music' },
  { id: '26', title: 'Vocal Performance', creator: 'Music Creator 4', creatorAvatar: '#06D6A0', thumbnail: '#06D6A0', duration: 27, views: 1320000, likes: 109000, comments: 2700, uploadDate: '2025-10-11', category: 'short', shortCategory: 'music' },
  { id: '27', title: 'DJ Mix Preview', creator: 'Music Creator 5', creatorAvatar: '#4D96FF', thumbnail: '#4D96FF', duration: 30, views: 1180000, likes: 97000, comments: 2400, uploadDate: '2025-10-10', category: 'short', shortCategory: 'music' },
  
  // Dance Shorts
  { id: '28', title: '💃 Trending Dance', creator: 'Dance Creator 1', creatorAvatar: '#9D4EDD', thumbnail: '#9D4EDD', duration: 21, views: 2100000, likes: 173000, comments: 4600, uploadDate: '2025-10-13', category: 'short', shortCategory: 'dance' },
  { id: '29', title: 'Choreography Tutorial', creator: 'Dance Creator 2', creatorAvatar: '#C77DFF', thumbnail: '#C77DFF', duration: 29, views: 1720000, likes: 142000, comments: 3700, uploadDate: '2025-10-12', category: 'short', shortCategory: 'dance' },
  { id: '30', title: 'Quick Dance', creator: 'Dance Creator 3', creatorAvatar: '#E0AAFF', thumbnail: '#E0AAFF', duration: 16, views: 1560000, likes: 128000, comments: 3300, uploadDate: '2025-10-11', category: 'short', shortCategory: 'dance' },
  { id: '31', title: 'Dance Challenge', creator: 'Dance Creator 4', creatorAvatar: '#FF6FD8', thumbnail: '#FF6FD8', duration: 24, views: 1390000, likes: 115000, comments: 2900, uploadDate: '2025-10-10', category: 'short', shortCategory: 'dance' },
];

export const categories: Category[] = [
  {
    id: 'most-popular',
    name: 'Most Popular Videos',
    videos: mockVideos.filter(v => [1, 2, 3, 4].includes(parseInt(v.id))),
  },
  {
    id: 'trending',
    name: 'Trending',
    videos: mockVideos.filter(v => [5, 6, 7, 8].includes(parseInt(v.id))),
  },
  {
    id: 'comedy',
    name: 'Comedy',
    videos: mockVideos.filter(v => [9, 10, 11].includes(parseInt(v.id))),
  },
  {
    id: 'continue-watching',
    name: 'Continue Watching',
    videos: mockVideos.filter(v => v.progress !== undefined),
  },
  {
    id: 'motivation',
    name: 'Motivation',
    videos: mockVideos.filter(v => [15, 16].includes(parseInt(v.id))),
  },
];

export const shortsCategories: ShortsCategory[] = [
  {
    id: 'comedy-shorts',
    name: 'Comedy & Meme Shorts',
    shorts: mockVideos.filter(v => v.shortCategory === 'comedy'),
  },
  {
    id: 'music-shorts',
    name: 'Music Shorts',
    shorts: mockVideos.filter(v => v.shortCategory === 'music'),
  },
  {
    id: 'dance-shorts',
    name: 'Dance Shorts',
    shorts: mockVideos.filter(v => v.shortCategory === 'dance'),
  },
];

export const shortsVideos = mockVideos.filter(v => v.category === 'short');

export const categoryTags = ['ca1', 'ca2', 'ca3', 'ca4', 'ca5'];

export const userProfile: UserProfile = {
  username: 'user_account',
  displayName: 'Your Profile',
  avatar: 'UQ',
  followers: 12500,
  following: 384,
};

// Related videos for a given video
export const getRelatedVideos = (videoId: string): Video[] => {
  return mockVideos.filter(v => v.category === 'long' && v.id !== videoId).slice(0, 6);
};
