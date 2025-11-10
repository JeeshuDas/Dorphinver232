import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../../App';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Video'> & {
  followedCreators: Set<string>;
  onFollowCreator: (creatorId: string) => void;
  comments: Record<string, any[]>;
  onAddComment: (videoId: string, text: string) => void;
  reactedVideos: Set<string>;
  onReact: (videoId: string) => void;
  onCollapse: (video: any, currentTime?: number) => void;
};

export default function FullScreenVideoPlayer({
  navigation,
  route,
  followedCreators,
  onFollowCreator,
  comments,
  onAddComment,
  reactedVideos,
  onReact,
  onCollapse,
}: Props) {
  const { video } = route.params;
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeOverlay, setActiveOverlay] = useState<'details' | 'comments' | 'share' | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const videoRef = useRef<ExpoVideo>(null);

  const creatorId = video.creator.toLowerCase().replace(/\s+/g, '-');
  const isFollowing = followedCreators.has(creatorId);
  const hasReacted = reactedVideos.has(video.id);
  const videoComments = comments[video.id] || [];

  const handleReact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onReact(video.id);
    
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

  const handlePlayPause = () => {
    if (isPlaying) {
      videoRef.current?.pauseAsync();
    } else {
      videoRef.current?.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        style={StyleSheet.absoluteFill}
        onPress={() => setShowControls(!showControls)}
      >
        <ExpoVideo
          ref={videoRef}
          source={{ uri: video.videoUrl }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={isPlaying}
          isMuted={false}
        />
      </TouchableOpacity>

      {/* Top Controls */}
      {showControls && (
        <>
          <View style={styles.topControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => navigation.goBack()}
            >
              <BlurView intensity={20} style={styles.blurButton}>
                <Icon name="chevron-back" size={28} color={COLORS.text} />
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton}>
              <BlurView intensity={20} style={styles.blurButton}>
                <Icon name="ellipsis-vertical" size={24} color={COLORS.text} />
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Center Play/Pause */}
          <TouchableOpacity
            style={styles.centerPlayButton}
            onPress={handlePlayPause}
          >
            <BlurView intensity={30} style={styles.playPauseButton}>
              <Icon
                name={isPlaying ? 'pause' : 'play'}
                size={48}
                color={COLORS.text}
              />
            </BlurView>
          </TouchableOpacity>

          {/* Bottom Info */}
          <View style={styles.bottomContainer}>
            {/* Video Info */}
            <View style={styles.videoInfo}>
              <View style={styles.creatorRow}>
                <View
                  style={[styles.creatorAvatar, { backgroundColor: video.creatorAvatar }]}
                >
                  <Icon name="person" size={20} color="rgba(255,255,255,0.8)" />
                </View>
                <View style={styles.creatorInfo}>
                  <Text style={styles.creatorName}>{video.creator}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.views}>{video.views} views</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.date}>{video.uploadDate}</Text>
                  </View>
                </View>
                {!isFollowing && (
                  <TouchableOpacity style={styles.followButton} onPress={handleFollow}>
                    <Text style={styles.followText}>Follow</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <Text style={styles.title} numberOfLines={2}>
                {video.title}
              </Text>
            </View>

            {/* Action Bar */}
            <View style={styles.actionBar}>
              <TouchableOpacity style={styles.actionButton} onPress={handleReact}>
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <Icon
                    name={hasReacted ? 'heart' : 'heart-outline'}
                    size={28}
                    color={hasReacted ? COLORS.primary : COLORS.text}
                  />
                </Animated.View>
                <Text style={styles.actionText}>{video.likes || '0'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setActiveOverlay('comments')}
              >
                <Icon name="chatbubble-outline" size={28} color={COLORS.text} />
                <Text style={styles.actionText}>{videoComments.length}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setActiveOverlay('share')}
              >
                <Icon name="share-outline" size={28} color={COLORS.text} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Icon name="ellipsis-horizontal" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  video: {
    width,
    height,
  },
  topControls: {
    position: 'absolute',
    top: 60,
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  controlButton: {
    width: 44,
    height: 44,
  },
  blurButton: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  centerPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    zIndex: 5,
  },
  playPauseButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 40,
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 10,
    gap: SPACING.md,
  },
  videoInfo: {
    gap: SPACING.sm,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  creatorName: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  views: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  metaDot: {
    color: COLORS.textTertiary,
    fontSize: FONT_SIZES.sm,
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
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
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.glassBackground,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xs,
  },
});
