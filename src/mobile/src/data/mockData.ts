import { Video } from '../types';

export const mockVideos: Video[] = [
  // Long Videos
  {
    id: '1',
    title: 'Attack on Titan - Season Finale Review',
    creator: 'AnimeZone',
    creatorAvatar: '#FF6B9D',
    thumbnail: 'https://images.unsplash.com/photo-1668119064420-fb738fb05e32?w=400',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '14:05',
    views: '3.2M',
    uploadDate: '2025-11-05',
    category: 'long',
    likes: '285K',
    description: 'In-depth review of the Attack on Titan season finale'
  },
  {
    id: '2',
    title: 'Live Concert - Summer Music Festival 2025',
    creator: 'MusicWorld',
    creatorAvatar: '#FFD93D',
    thumbnail: 'https://images.unsplash.com/photo-1545538331-78f76ca06830?w=400',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: '20:40',
    views: '2.8M',
    uploadDate: '2025-11-03',
    category: 'long',
    likes: '195K'
  },
  {
    id: '3',
    title: 'Stand-Up Comedy Special - Laugh Till You Cry',
    creator: 'ComedyClub',
    creatorAvatar: '#06D6A0',
    thumbnail: 'https://images.unsplash.com/photo-1610964200986-a59fe203c46d?w=400',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '39:00',
    views: '4.1M',
    uploadDate: '2025-11-01',
    category: 'long',
    likes: '342K'
  },
  {
    id: '4',
    title: 'Epic Gaming Tournament - Final Match',
    creator: 'GamerPro',
    creatorAvatar: '#9D4EDD',
    thumbnail: 'https://images.unsplash.com/photo-1635372708431-64774de60e20?w=400',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    duration: '26:20',
    views: '5.2M',
    uploadDate: '2025-10-30',
    category: 'long',
    likes: '428K'
  },
  {
    id: '5',
    title: 'Cooking With Chef - Perfect Ramen Recipe',
    creator: 'FoodieChannel',
    creatorAvatar: '#FF8A3D',
    thumbnail: 'https://images.unsplash.com/photo-1514986888952-8cd320577b68?w=400',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    duration: '12:00',
    views: '1.8M',
    uploadDate: '2025-10-28',
    category: 'long',
    likes: '142K'
  },
  
  // Shorts
  {
    id: '6',
    title: '🎌 Anime Edit - Demon Slayer',
    creator: 'AnimeEdits',
    creatorAvatar: '#7B2CBF',
    thumbnail: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '0:24',
    views: '3.8M',
    uploadDate: '2025-11-06',
    category: 'short',
    likes: '312K'
  },
  {
    id: '7',
    title: '🎵 DJ Mix - Electronic Beats',
    creator: 'DJMaster',
    creatorAvatar: '#F72585',
    thumbnail: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?w=400',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: '0:29',
    views: '2.9M',
    uploadDate: '2025-11-04',
    category: 'short',
    likes: '241K'
  },
  {
    id: '8',
    title: '😂 When WiFi Stops Working',
    creator: 'MemeLord',
    creatorAvatar: '#560BAD',
    thumbnail: 'https://images.unsplash.com/photo-1740950024560-3399bda3a098?w=400',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration: '0:18',
    views: '4.2M',
    uploadDate: '2025-11-02',
    category: 'short',
    likes: '356K'
  },
];

export const shortsVideos = mockVideos.filter(v => v.category === 'short');
