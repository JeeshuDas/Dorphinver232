import { Video, Category, ShortsCategory, UserProfile } from '../types';

export const mockVideos: Video[] = [
  // Long Videos (5)
  { id: '1', title: 'Attack on Titan - Season Finale Review', creator: 'AnimeZone', creatorAvatar: '#FF6B9D', thumbnail: 'https://images.unsplash.com/photo-1668119064420-fb738fb05e32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMGNoYXJhY3RlcnxlbnwxfHx8fDE3NjI0ODQzMDB8MA&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', duration: 845, views: 3200000, likes: 285000, comments: 12500, uploadDate: '2025-11-05', category: 'long' },
  { id: '2', title: 'Live Concert - Summer Music Festival 2025', creator: 'MusicWorld', creatorAvatar: '#FFD93D', thumbnail: 'https://images.unsplash.com/photo-1545538331-78f76ca06830?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBwZXJmb3JtYW5jZXxlbnwxfHx8fDE3NjI0MTM3Njh8MA&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', duration: 1240, views: 2800000, likes: 195000, comments: 8900, uploadDate: '2025-11-03', category: 'long' },
  { id: '3', title: 'Stand-Up Comedy Special - Laugh Till You Cry', creator: 'ComedyClub', creatorAvatar: '#06D6A0', thumbnail: 'https://images.unsplash.com/photo-1610964200986-a59fe203c46d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21lZHklMjBzdGFuZCUyMHVwfGVufDF8fHx8MTc2MjUxODQ0M3ww&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', duration: 2340, views: 4100000, likes: 342000, comments: 15800, uploadDate: '2025-11-01', category: 'long' },
  { id: '4', title: 'Epic Gaming Tournament - Final Match', creator: 'GamerPro', creatorAvatar: '#9D4EDD', thumbnail: 'https://images.unsplash.com/photo-1635372708431-64774de60e20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBlc3BvcnRzfGVufDF8fHx8MTc2MjQ5MjAwMXww&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', duration: 1580, views: 5200000, likes: 428000, comments: 21400, uploadDate: '2025-10-30', category: 'long' },
  { id: '5', title: 'Cooking With Chef - Perfect Ramen Recipe', creator: 'FoodieChannel', creatorAvatar: '#FF8A3D', thumbnail: 'https://images.unsplash.com/photo-1514986888952-8cd320577b68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwZm9vZHxlbnwxfHx8fDE3NjI0NDY1Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', duration: 720, views: 1850000, likes: 142000, comments: 6500, uploadDate: '2025-10-28', category: 'long' },
  { id: '9', title: 'Top 10 Manga Must-Reads of 2025', creator: 'MangaReviews', creatorAvatar: '#E91E63', thumbnail: 'https://images.unsplash.com/photo-1627056503679-34051c0122c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMG1hbmdhfGVufDF8fHx8MTc2MjQ5MzA4Mnww&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', duration: 920, views: 2650000, likes: 198000, comments: 9200, uploadDate: '2025-11-04', category: 'long' },
  { id: '10', title: 'Internet Meme Compilation - You Laugh You Lose', creator: 'ViralContent', creatorAvatar: '#00BCD4', thumbnail: 'https://images.unsplash.com/photo-1762365355558-a4f15f4814f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW1lJTIwZnVubnklMjBpbnRlcm5ldHxlbnwxfHx8fDE3NjI0MzY1MTN8MA&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', duration: 680, views: 6800000, likes: 542000, comments: 28400, uploadDate: '2025-11-02', category: 'long' },
  { id: '11', title: 'Sci-Fi Movie Breakdown - Dune Part 3 Analysis', creator: 'CinemaTheory', creatorAvatar: '#673AB7', thumbnail: 'https://images.unsplash.com/photo-1739433437912-cca661ba902f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMGNpbmVtYSUyMHRoZWF0ZXJ8ZW58MXx8fHwxNzYyNDUzMDkxfDA&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', duration: 1850, views: 3900000, likes: 312000, comments: 18600, uploadDate: '2025-10-31', category: 'long' },
  { id: '12', title: 'PS5 Game Review - The Ultimate RPG Experience', creator: 'GamersUnited', creatorAvatar: '#2196F3', thumbnail: 'https://images.unsplash.com/photo-1644571580854-114d7d8fa383?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBjb250cm9sbGVyJTIwcGxheXN0YXRpb258ZW58MXx8fHwxNzYyNDQ0NDA3fDA&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', duration: 1420, views: 4500000, likes: 385000, comments: 19800, uploadDate: '2025-10-29', category: 'long' },
  { id: '13', title: 'Live Music - Indie Band World Tour Highlights', creator: 'IndieMusicHub', creatorAvatar: '#FF5722', thumbnail: 'https://images.unsplash.com/photo-1738667289162-9e55132e18a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBzdGFnZXxlbnwxfHx8fDE3NjI1MTM3NjB8MA&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', duration: 2100, views: 3150000, likes: 265000, comments: 11200, uploadDate: '2025-10-27', category: 'long' },
  { id: '14', title: 'Street Art Documentary - Urban Graffiti Masters', creator: 'ArtStreet', creatorAvatar: '#4CAF50', thumbnail: 'https://images.unsplash.com/photo-1628522994788-53bc1b1502c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXQlMjBhcnQlMjBncmFmZml0aXxlbnwxfHx8fDE3NjI0NTEzMDN8MA&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', duration: 1680, views: 2200000, likes: 178000, comments: 7400, uploadDate: '2025-10-26', category: 'long' },
  { id: '15', title: 'Dance Battle Championship - Final Round', creator: 'DanceCrew', creatorAvatar: '#FF9800', thumbnail: 'https://images.unsplash.com/photo-1718908721930-31120bc1beb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYW5jZSUyMHBlcmZvcm1hbmNlfGVufDF8fHx8MTc2MjQ0MTczMnww&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', duration: 1350, views: 5800000, likes: 472000, comments: 24600, uploadDate: '2025-10-25', category: 'long' },
  { id: '16', title: 'Tech Review - Future of AI and Robotics', creator: 'TechVision', creatorAvatar: '#009688', thumbnail: 'https://images.unsplash.com/photo-1720962158937-7ea890052166?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwZnV0dXJpc3RpY3xlbnwxfHx8fDE3NjI0NzY0MDh8MA&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', duration: 1580, views: 4200000, likes: 335000, comments: 16800, uploadDate: '2025-10-24', category: 'long' },
  { id: '17', title: 'Cyberpunk 2077 - Hidden Easter Eggs Revealed', creator: 'NeonGamer', creatorAvatar: '#E91E63', thumbnail: 'https://images.unsplash.com/photo-1618902345120-77758161d808?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZW9uJTIwY3liZXJwdW5rfGVufDF8fHx8MTc2MjUyODM4MHww&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', duration: 1120, views: 5600000, likes: 448000, comments: 22400, uploadDate: '2025-10-23', category: 'long' },
  { id: '18', title: 'Extreme Skateboarding - Best Tricks Compilation', creator: 'XSportsTV', creatorAvatar: '#795548', thumbnail: 'https://images.unsplash.com/photo-1542727934-07691d6ebf0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2F0ZWJvYXJkJTIwZXh0cmVtZSUyMHNwb3J0c3xlbnwxfHx8fDE3NjI1MjgzODB8MA&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', duration: 840, views: 3750000, likes: 298000, comments: 13500, uploadDate: '2025-10-22', category: 'long' },
  
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
