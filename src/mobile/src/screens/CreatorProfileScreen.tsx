import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { mockVideos } from '../data/mockData';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import Icon from 'react-native-vector-icons/Ionicons';

type Props = NativeStackScreenProps<RootStackParamList, 'Creator'> & {
  followedCreators: Set<string>;
  onFollowCreator: (creatorId: string) => void;
};

export default function CreatorProfileScreen({
  navigation,
  route,
  followedCreators,
  onFollowCreator,
}: Props) {
  const { creatorId } = route.params;
  const isFollowing = followedCreators.has(creatorId);
  
  const creator = mockVideos.find(v => 
    v.creator.toLowerCase().replace(/\s+/g, '-') === creatorId
  );
  
  const creatorVideos = mockVideos.filter(v => 
    v.creator.toLowerCase().replace(/\s+/g, '-') === creatorId
  );

  if (!creator) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Creator not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{creator.creator}</Text>
        <TouchableOpacity>
          <Icon name="share-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View
            style={[styles.avatar, { backgroundColor: creator.creatorAvatar }]}
          >
            <Icon name="person" size={48} color="rgba(255,255,255,0.8)" />
          </View>
          
          <Text style={styles.creatorName}>{creator.creator}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{creatorVideos.length}</Text>
              <Text style={styles.statLabel}>Videos</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>2.4M</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>125</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowing && styles.followingButton
            ]}
            onPress={() => onFollowCreator(creatorId)}
          >
            <Icon
              name={isFollowing ? 'checkmark' : 'add'}
              size={20}
              color={COLORS.text}
            />
            <Text style={styles.followButtonText}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Videos Section */}
        <View style={styles.videosSection}>
          <Text style={styles.sectionTitle}>
            Videos ({creatorVideos.length})
          </Text>
          
          {creatorVideos.map(video => (
            <TouchableOpacity
              key={video.id}
              style={styles.videoItem}
              onPress={() => {
                if (video.category === 'short') {
                  navigation.navigate('Shorts', { startIndex: 0 });
                } else {
                  navigation.navigate('Video', { video });
                }
              }}
            >
              <Icon name="videocam" size={24} color={COLORS.textSecondary} />
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle} numberOfLines={2}>
                  {video.title}
                </Text>
                <Text style={styles.videoMeta}>
                  {video.views} views • {video.uploadDate}
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
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
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  creatorName: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    marginBottom: SPACING.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.xxxl,
    marginBottom: SPACING.xl,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.md,
  },
  followingButton: {
    backgroundColor: COLORS.surface,
  },
  followButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  videosSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.lg,
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    marginBottom: 4,
  },
  videoMeta: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  errorText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    textAlign: 'center',
    marginTop: SPACING.xxxl,
  },
});
