import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Video } from '../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import Icon from 'react-native-vector-icons/Ionicons';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'> & {
  userVideos: Video[];
  onUpload: (video: Video) => void;
  onDelete: (videoId: string) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  userAvatar: string;
  onAvatarChange: (avatar: string) => void;
  userDisplayName: string;
  onDisplayNameChange: (name: string) => void;
  userBio: string;
  onBioChange: (bio: string) => void;
  showShorts: boolean;
  onShowShortsToggle: (show: boolean) => void;
  shortsLimit: number;
  onShortsLimitChange: (limit: number) => void;
};

export default function ProfileScreen({
  navigation,
  userVideos,
  isDarkMode,
  onThemeToggle,
  userAvatar,
  userDisplayName,
}: Props) {
  const longVideos = userVideos.filter(v => v.category === 'long');
  const shorts = userVideos.filter(v => v.category === 'short');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <Icon name="settings-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{userAvatar}</Text>
          </View>
          <Text style={styles.displayName}>{userDisplayName}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{userVideos.length}</Text>
              <Text style={styles.statLabel}>Videos</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>1.2K</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>842</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Videos Grid */}
        <View style={styles.videosSection}>
          <View style={styles.tabsRow}>
            <TouchableOpacity style={styles.tab}>
              <Icon name="videocam" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab}>
              <Icon name="heart" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Your Videos ({longVideos.length})</Text>
          
          {longVideos.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="videocam-outline" size={64} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>No videos yet</Text>
              <TouchableOpacity style={styles.uploadButton}>
                <Icon name="add" size={20} color={COLORS.text} />
                <Text style={styles.uploadButtonText}>Upload Video</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={onThemeToggle}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
            />
          </View>
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
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  avatarText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
  },
  displayName: {
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
  editButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.sm,
  },
  editButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  videosSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xxxl,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xxxl,
    marginBottom: SPACING.xl,
  },
  tab: {
    padding: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl * 2,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  uploadButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  settingsSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  settingLabel: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
  },
});
