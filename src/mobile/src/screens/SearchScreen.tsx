import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { mockVideos } from '../data/mockData';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import Icon from 'react-native-vector-icons/Ionicons';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export default function SearchScreen({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVideos = mockVideos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Search..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {searchQuery.length > 0 ? (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              {filteredVideos.length} results for "{searchQuery}"
            </Text>
            {filteredVideos.map(video => (
              <TouchableOpacity
                key={video.id}
                style={styles.resultItem}
                onPress={() => {
                  if (video.category === 'short') {
                    navigation.navigate('Shorts', { startIndex: 0 });
                  } else {
                    navigation.navigate('Video', { video });
                  }
                }}
              >
                <Icon name="videocam" size={24} color={COLORS.textSecondary} />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultTitle} numberOfLines={2}>
                    {video.title}
                  </Text>
                  <Text style={styles.resultCreator}>{video.creator}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.sectionTitle}>Trending Searches</Text>
            {['Anime', 'Music', 'Gaming', 'Comedy', 'Food'].map(tag => (
              <TouchableOpacity
                key={tag}
                style={styles.suggestionItem}
                onPress={() => setSearchQuery(tag)}
              >
                <Icon name="trending-up" size={20} color={COLORS.textSecondary} />
                <Text style={styles.suggestionText}>{tag}</Text>
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
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxxl + 20,
    paddingBottom: SPACING.lg,
    gap: SPACING.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
  },
  scrollView: {
    flex: 1,
  },
  resultsContainer: {
    padding: SPACING.lg,
  },
  resultsTitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.lg,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    marginBottom: 4,
  },
  resultCreator: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  suggestionsContainer: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.lg,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  suggestionText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
  },
});
