// Helper script to generate additional mock videos
// Run this to get additional video data

const creators = [
  'TechReviewer', 'GameMaster', 'ChefPro', 'ArtistLife', 'MusicMix',
  'ComedyKing', 'TravelVlog', 'FitnessGuru', 'BeautyTips', 'DIYCrafts',
  'ScienceExp', 'HistoryBuff', 'BookReview', 'PodcastPro', 'NewsDaily',
  'MotivationHub', 'LanguageLearner', 'PetLover', 'GardenGuru', 'CarEnthusiast'
];

const colors = [
  '#FF6B9D', '#FFD93D', '#06D6A0', '#9D4EDD', '#FF8A3D',
  '#E91E63', '#00BCD4', '#673AB7', '#2196F3', '#FF5722',
  '#4CAF50', '#FF9800', '#009688', '#795548', '#8BC34A',
  '#FFC107', '#03A9F4', '#F44336', '#9C27B0', '#FFEB3B'
];

const thumbnails = [
  'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0',
  'https://images.unsplash.com/photo-1533738363-b7f9aef128ce',
  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3',
  'https://images.unsplash.com/photo-1614680376408-81e91ffe3db7',
  'https://images.unsplash.com/photo-1611926653458-09294b3142bf'
];

const videoUrls = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
];

const titles = [
  'Amazing Tutorial', 'Expert Guide', 'Full Analysis', 'Complete Review',
  'Top Secrets', 'Pro Tips', 'Ultimate Guide', 'Best Practices',
  'Hidden Features', 'Advanced Techniques', 'Master Class', 'Deep Dive',
  'Epic Moments', 'Exclusive Content', 'Breaking News', 'Live Session',
  'Behind Scenes', 'Special Edition', 'Reaction Video', 'Challenge Accepted'
];

for (let i = 31; i <= 100; i++) {
  const creator = creators[i % creators.length];
  const color = colors[i % colors.length];
  const thumbnail = thumbnails[i % thumbnails.length];
  const videoUrl = videoUrls[i % videoUrls.length];
  const title = titles[i % titles.length];
  
  const views = Math.floor(Math.random() * 5000000) + 1000000;
  const likes = Math.floor(views * (Math.random() * 0.15 + 0.05));
  const watchTime = Math.floor(views * (Math.random() * 1.5 + 0.3));
  const comments = Math.floor(likes * (Math.random() * 0.08 + 0.02));
  const duration = Math.floor(Math.random() * 2000) + 600;
  
  const date = new Date('2025-10-10');
  date.setDate(date.getDate() - (i - 30));
  
  console.log(`  { id: '${i}', title: '${title} - Part ${i}', creator: '${creator}', creatorAvatar: '${color}', thumbnail: '${thumbnail}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8ZW58MXx8fHwxNzYyNTI4Mzgwfda&ixlib=rb-4.1.0&q=80&w=1080', videoUrl: '${videoUrl}', duration: ${duration}, views: ${views}, likes: ${likes}, comments: ${comments}, uploadDate: '${date.toISOString().split('T')[0]}', category: 'long', watchTime: ${watchTime} },`);
}
