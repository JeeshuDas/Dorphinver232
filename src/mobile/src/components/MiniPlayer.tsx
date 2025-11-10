import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Video } from '../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface Props {
  video: Video;
  onClose: () => void;
  onExpand: (video: Video) => void;
}

export function MiniPlayer({ video, onClose, onExpand }: Props) {
  const handleExpand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onExpand(video);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={80} style={styles.blurContainer}>
        <TouchableOpacity
          style={styles.content}
          activeOpacity={0.9}
          onPress={handleExpand}
        >
          <View style={styles.infoContainer}>
            <View
              style={[styles.avatar, { backgroundColor: video.creatorAvatar }]}
            >
              <Icon name="person" size={16} color="rgba(255,255,255,0.8)" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {video.title}
              </Text>
              <Text style={styles.creator} numberOfLines={1}>
                {video.creator}
              </Text>
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.controlButton}>
              <Icon name="play" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={(e) => {
                e.stopPropagation();
                handleClose();
              }}
            >
              <Icon name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 100,
  },
  blurContainer: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  creator: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  controlButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
