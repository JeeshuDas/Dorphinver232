import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Video } from '../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const SHORT_WIDTH = (width - SPACING.lg * 2 - SPACING.md * 2) / 3;
const SHORT_HEIGHT = SHORT_WIDTH * 1.77;

interface Props {
  shorts: Video[];
  onShortPress: (index: number) => void;
}

export function ShortsRow({ shorts, onShortPress }: Props) {
  const handlePress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShortPress(index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="flash" size={20} color={COLORS.primary} />
        <Text style={styles.title}>Shorts</Text>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {shorts.map((short, index) => (
          <TouchableOpacity
            key={short.id}
            style={styles.shortCard}
            activeOpacity={0.9}
            onPress={() => handlePress(index)}
          >
            <Image
              source={{ uri: short.thumbnail }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            
            {/* Gradient Overlay */}
            <View style={styles.gradient} />
            
            {/* Info Overlay */}
            <View style={styles.infoOverlay}>
              <View style={styles.viewsRow}>
                <Icon name="eye" size={12} color={COLORS.text} />
                <Text style={styles.views}>{short.views}</Text>
              </View>
              <Text style={styles.shortTitle} numberOfLines={2}>
                {short.title}
              </Text>
            </View>

            {/* Play Icon */}
            <View style={styles.playIcon}>
              <Icon name="play" size={24} color={COLORS.text} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  shortCard: {
    width: SHORT_WIDTH,
    height: SHORT_HEIGHT,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    marginRight: SPACING.md,
    ...SHADOWS.md,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.sm,
  },
  viewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  views: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  shortTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
});
