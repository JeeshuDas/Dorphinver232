import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
} from 'react-native';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Video } from '../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const VIDEO_WIDTH = width - SPACING.lg * 2;

interface Props {
  video: Video;
  onPress: () => void;
  isPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  hasReacted?: boolean;
  onReact?: () => void;
  comments?: any[];
  followedCreators?: Set<string>;
  onFollowCreator?: (creatorId: string) => void;
}

export function VideoCard({
  video,
  onPress,
  isPlaying = false,
  onPlayingChange,
  hasReacted = false,
  onReact,
  comments = [],
  followedCreators,
  onFollowCreator,
}: Props) {
  const [showControls, setShowControls] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<'details' | 'comments' | 'share' | null>(null);
  const videoRef = useRef<ExpoVideo>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const creatorId = video.creator.toLowerCase().replace(/\s+/g, '-');
  const isFollowing = followedCreators?.has(creatorId);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handleReact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onReact?.();
    
    // Animate heart
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
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
    onFollowCreator?.(creatorId);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={handlePress}
      style={styles.container}
    >
      <View style={styles.videoContainer}>
        <Image
          source={{ uri: video.thumbnail }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        
        {/* Duration Badge */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>

        {/* Play Button Overlay */}
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Icon name="play" size={32} color={COLORS.text} />
          </View>
        </View>
      </View>

      {/* Video Info */}
      <View style={styles.infoContainer}>
        <View style={styles.creatorRow}>
          <View
            style={[styles.creatorAvatar, { backgroundColor: video.creatorAvatar }]}
          >
            <Icon name="person" size={20} color="rgba(255,255,255,0.8)" />
          </View>
          
          <View style={styles.creatorInfo}>
            <Text style={styles.title} numberOfLines={2}>
              {video.title}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.creator}>{video.creator}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.views}>{video.views} views</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.date}>{video.uploadDate}</Text>
            </View>
          </View>

          {!isFollowing && (
            <TouchableOpacity
              style={styles.followButton}
              onPress={handleFollow}
            >
              <Icon name="add" size={16} color={COLORS.text} />
            </TouchableOpacity>
          )}
        </View>

        {/* Action Bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleReact}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Icon
                name={hasReacted ? 'heart' : 'heart-outline'}
                size={24}
                color={hasReacted ? COLORS.primary : COLORS.textSecondary}
              />
            </Animated.View>
            <Text style={styles.actionText}>{video.likes || '0'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setActiveOverlay('comments')}
          >
            <Icon name="chatbubble-outline" size={24} color={COLORS.textSecondary} />
            <Text style={styles.actionText}>{comments.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setActiveOverlay('share')}
          >
            <Icon name="share-outline" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Icon name="ellipsis-vertical" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  videoContainer: {
    width: VIDEO_WIDTH,
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    ...SHADOWS.md,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  durationText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  infoContainer: {
    marginTop: SPACING.md,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  creatorInfo: {
    flex: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creator: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  metaDot: {
    color: COLORS.textTertiary,
    fontSize: FONT_SIZES.sm,
    marginHorizontal: 4,
  },
  views: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  followButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
  },
});
