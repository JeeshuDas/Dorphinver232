import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../../App';
import { Video } from '../types';
import { mockVideos } from '../data/mockData';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Shorts'> & {
  userVideos: Video[];
  followedCreators: Set<string>;
  onFollowCreator: (creatorId: string) => void;
  reactedVideos: Set<string>;
  onReact: (videoId: string) => void;
  comments: Record<string, any[]>;
  onAddComment: (videoId: string, text: string) => void;
  onCollapse: (video: Video, currentTime?: number) => void;
};

export default function ShortsScreen({
  navigation,
  route,
  userVideos,
  followedCreators,
  onFollowCreator,
  reactedVideos,
  onReact,
  comments,
  onAddComment,
  onCollapse,
}: Props) {
  const userShorts = userVideos.filter(v => v.category === 'short');
  const mockShorts = mockVideos.filter(v => v.category === 'short');
  const allShorts = [...userShorts, ...mockShorts];
  
  const startIndex = route.params?.startIndex || 0;
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const flatListRef = useRef<FlatList>(null);

  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderShort = ({ item, index }: { item: Video; index: number }) => (
    <ShortItem
      video={item}
      isActive={index === currentIndex}
      hasReacted={reactedVideos.has(item.id)}
      onReact={() => onReact(item.id)}
      comments={comments[item.id] || []}
      followedCreators={followedCreators}
      onFollowCreator={onFollowCreator}
      onBack={() => navigation.goBack()}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={allShorts}
        renderItem={renderShort}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialScrollIndex={startIndex}
        getItemLayout={(data, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />
    </View>
  );
}

interface ShortItemProps {
  video: Video;
  isActive: boolean;
  hasReacted: boolean;
  onReact: () => void;
  comments: any[];
  followedCreators: Set<string>;
  onFollowCreator: (creatorId: string) => void;
  onBack: () => void;
}

function ShortItem({
  video,
  isActive,
  hasReacted,
  onReact,
  comments,
  followedCreators,
  onFollowCreator,
  onBack,
}: ShortItemProps) {
  const [showControls, setShowControls] = useState(true);
  const [activeOverlay, setActiveOverlay] = useState<'details' | 'comments' | 'share' | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const videoRef = useRef<ExpoVideo>(null);

  const creatorId = video.creator.toLowerCase().replace(/\s+/g, '-');
  const isFollowing = followedCreators.has(creatorId);

  const handleReact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onReact();
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.4,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleFollow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFollowCreator(creatorId);
  };

  return (
    <View style={styles.shortContainer}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => setShowControls(!showControls)}
      >
        <ExpoVideo
          ref={videoRef}
          source={{ uri: video.videoUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          shouldPlay={isActive}
          isLooping
          isMuted={false}
        />
      </Pressable>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <BlurView intensity={20} style={styles.blurButton}>
          <Icon name="chevron-back" size={28} color={COLORS.text} />
        </BlurView>
      </TouchableOpacity>

      {/* Action Bar */}
      {showControls && (
        <View style={styles.actionBar}>
          <View style={styles.actionButtons}>
            {/* React */}
            <TouchableOpacity style={styles.actionButton} onPress={handleReact}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Icon
                  name={hasReacted ? 'heart' : 'heart-outline'}
                  size={32}
                  color={hasReacted ? COLORS.primary : COLORS.text}
                />
              </Animated.View>
              <Text style={styles.actionCount}>{video.likes || '0'}</Text>
            </TouchableOpacity>

            {/* Comments */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setActiveOverlay('comments')}
            >
              <Icon name="chatbubble-outline" size={32} color={COLORS.text} />
              <Text style={styles.actionCount}>{comments.length}</Text>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setActiveOverlay('share')}
            >
              <Icon name="share-outline" size={32} color={COLORS.text} />
            </TouchableOpacity>

            {/* More */}
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="ellipsis-vertical" size={32} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Video Info */}
      {showControls && (
        <View style={styles.infoContainer}>
          <View style={styles.creatorRow}>
            <View
              style={[styles.creatorAvatar, { backgroundColor: video.creatorAvatar }]}
            >
              <Icon name="person" size={20} color="rgba(255,255,255,0.8)" />
            </View>
            <Text style={styles.creatorName}>{video.creator}</Text>
            {!isFollowing && (
              <TouchableOpacity style={styles.followButton} onPress={handleFollow}>
                <Text style={styles.followText}>Follow</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.title} numberOfLines={3}>
            {video.title}
          </Text>
          
          <View style={styles.metaRow}>
            <Icon name="eye" size={14} color={COLORS.textSecondary} />
            <Text style={styles.views}>{video.views} views</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.date}>{video.uploadDate}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  shortContainer: {
    width,
    height,
    backgroundColor: COLORS.background,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: SPACING.lg,
    zIndex: 10,
  },
  blurButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  actionBar: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: 200,
    zIndex: 5,
  },
  actionButtons: {
    gap: SPACING.xl,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 40,
    left: SPACING.lg,
    right: 80,
    zIndex: 5,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  creatorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  creatorName: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  followButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  followText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  views: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  metaDot: {
    color: COLORS.textTertiary,
    fontSize: FONT_SIZES.sm,
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
