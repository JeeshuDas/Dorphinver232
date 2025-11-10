import React, { useState } from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'Leaderboard'>;

export default function LeaderboardScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<'creators' | 'videos'>('creators');

  // Get unique creators with their stats
  const creatorsMap = new Map();
  mockVideos.forEach(v => {
    if (!creatorsMap.has(v.creator)) {
      creatorsMap.set(v.creator, {
        name: v.creator,
        avatar: v.creatorAvatar,
        id: v.creator.toLowerCase().replace(/\s+/g, '-'),
        videos: 0,
        views: 0,
      });
    }
    const creator = creatorsMap.get(v.creator);
    creator.videos++;
    creator.views += parseInt(v.views.replace(/[MK]/g, '')) * (v.views.includes('M') ? 1000000 : 1000);
  });

  const topCreators = Array.from(creatorsMap.values())
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  const topVideos = [...mockVideos]
    .sort((a, b) => {
      const aViews = parseInt(a.views.replace(/[MK]/g, '')) * (a.views.includes('M') ? 1000000 : 1000);
      const bViews = parseInt(b.views.replace(/[MK]/g, '')) * (b.views.includes('M') ? 1000000 : 1000);
      return bViews - aViews;
    })
    .slice(0, 10);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'creators' && styles.activeTab]}
          onPress={() => setActiveTab('creators')}
        >
          <Text style={[styles.tabText, activeTab === 'creators' && styles.activeTabText]}>
            Creators
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
          onPress={() => setActiveTab('videos')}
        >
          <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>
            Videos
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'creators' ? (
          <View style={styles.listContainer}>
            {topCreators.map((creator, index) => (
              <TouchableOpacity
                key={creator.id}
                style={styles.listItem}
                onPress={() => navigation.navigate('Creator', { creatorId: creator.id })}
              >
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View
                  style={[styles.creatorAvatar, { backgroundColor: creator.avatar }]}
                >
                  <Icon name="person" size={24} color="rgba(255,255,255,0.8)" />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{creator.name}</Text>
                  <Text style={styles.itemMeta}>
                    {creator.videos} videos • {(creator.views / 1000000).toFixed(1)}M views
                  </Text>
                </View>
                <Icon name="chevron-forward" size={20} color={COLORS.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.listContainer}>
            {topVideos.map((video, index) => (
              <TouchableOpacity
                key={video.id}
                style={styles.listItem}
                onPress={() => {
                  if (video.category === 'short') {
                    navigation.navigate('Shorts', { startIndex: 0 });
                  } else {
                    navigation.navigate('Video', { video });
                  }
                }}
              >
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {video.title}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {video.creator} • {video.views} views
                  </Text>
                </View>
                <Icon name="chevron-forward" size={20} color={COLORS.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    padding: SPACING.lg,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemMeta: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
});
