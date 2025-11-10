import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Video } from '../types';
import { mockVideos } from '../data/mockData';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { VideoCard } from '../components/VideoCard';
import { ShortsRow } from '../components/ShortsRow';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Home'> & {
  userVideos: Video[];
  followedCreators: Set<string>;
  onFollowCreator: (creatorId: string) => void;
  showShorts: boolean;
  shortsLimit: number;
  reactedVideos: Set<string>;
  onReact: (videoId: string) => void;
  comments: Record<string, any[]>;
  onAddComment: (videoId: string, text: string) => void;
  userAvatar: string;
};

export default function HomeScreen({
  navigation,
  userVideos,
  followedCreators,
  onFollowCreator,
  showShorts,
  shortsLimit,
  reactedVideos,
  onReact,
  comments,
  onAddComment,
  userAvatar,
}: Props) {
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  
  // Combine user videos with mock videos (user videos first)
  const userLongVideos = userVideos.filter(v => v.category === 'long');
  const mockLongVideos = mockVideos.filter(v => v.category === 'long');
  const longVideos = [...userLongVideos, ...mockLongVideos];
  
  const userShortsVideos = userVideos.filter(v => v.category === 'short');
  const mockShortsVideos = mockVideos.filter(v => v.category === 'short');
  const shortsVideos = [...userShortsVideos, ...mockShortsVideos].slice(0, shortsLimit);

  // Get unique creators
  const allVideos = [...userVideos, ...mockVideos];
  const creatorsMap = new Map();
  allVideos.forEach(v => {
    if (!creatorsMap.has(v.creator)) {
      creatorsMap.set(v.creator, {
        name: v.creator,
        avatar: v.creatorAvatar,
        id: v.creator.toLowerCase().replace(/\s+/g, '-'),
      });
    }
  });
  const followedCreatorsList = Array.from(creatorsMap.values()).filter(c =>
    followedCreators.has(c.id)
  );

  const handleVideoClick = useCallback((video: Video) => {
    if (video.category === 'short') {
      const allShorts = [...userShortsVideos, ...mockShortsVideos];
      const startIndex = allShorts.findIndex(v => v.id === video.id);
      navigation.navigate('Shorts', { startIndex: startIndex >= 0 ? startIndex : 0 });
    } else {
      navigation.navigate('Video', { video });
    }
  }, [navigation, userShortsVideos, mockShortsVideos]);

  const handleCreatorClick = useCallback((creatorId: string) => {
    navigation.navigate('Creator', { creatorId });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.logo}>dorphin</Text>
        </TouchableOpacity>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Icon name="search" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Icon name="trophy" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userAvatar}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Followed Creators */}
        {followedCreatorsList.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.creatorsScroll}
            contentContainerStyle={styles.creatorsContent}
          >
            {followedCreatorsList.map((creator) => (
              <TouchableOpacity
                key={creator.id}
                style={styles.creatorCard}
                onPress={() => handleCreatorClick(creator.id)}
              >
                <View
                  style={[
                    styles.creatorAvatar,
                    { backgroundColor: creator.avatar }
                  ]}
                >
                  <Icon name="person" size={32} color="rgba(255,255,255,0.8)" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* First Video */}
        {longVideos.length > 0 && (
          <View style={styles.videoSection}>
            <VideoCard
              video={longVideos[0]}
              onPress={() => handleVideoClick(longVideos[0])}
              isPlaying={currentlyPlayingId === longVideos[0].id}
              onPlayingChange={(playing) =>
                setCurrentlyPlayingId(playing ? longVideos[0].id : null)
              }
              hasReacted={reactedVideos.has(longVideos[0].id)}
              onReact={() => onReact(longVideos[0].id)}
              comments={comments[longVideos[0].id] || []}
              followedCreators={followedCreators}
              onFollowCreator={onFollowCreator}
            />
          </View>
        )}

        {/* Shorts Row */}
        {showShorts && shortsVideos.length > 0 && (
          <ShortsRow
            shorts={shortsVideos}
            onShortPress={(index) => navigation.navigate('Shorts', { startIndex: index })}
          />
        )}

        {/* Remaining Videos */}
        {longVideos.slice(1).map((video) => (
          <View key={video.id} style={styles.videoSection}>
            <VideoCard
              video={video}
              onPress={() => handleVideoClick(video)}
              isPlaying={currentlyPlayingId === video.id}
              onPlayingChange={(playing) =>
                setCurrentlyPlayingId(playing ? video.id : null)
              }
              hasReacted={reactedVideos.has(video.id)}
              onReact={() => onReact(video.id)}
              comments={comments[video.id] || []}
              followedCreators={followedCreators}
              onFollowCreator={onFollowCreator}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxxl + 20,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: 'Garet',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  avatarButton: {
    width: 40,
    height: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  avatarText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },
  creatorsScroll: {
    marginBottom: SPACING.md,
  },
  creatorsContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  creatorCard: {
    marginRight: SPACING.sm,
  },
  creatorAvatar: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  videoSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
});
