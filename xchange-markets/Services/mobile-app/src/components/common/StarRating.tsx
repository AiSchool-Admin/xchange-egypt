// ============================================
// Star Rating Component
// ============================================

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

interface StarRatingProps {
  rating: number;
  size?: number;
  maxStars?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showHalfStars?: boolean;
}

export default function StarRating({
  rating,
  size = 16,
  maxStars = 5,
  interactive = false,
  onRatingChange,
  showHalfStars = true,
}: StarRatingProps) {
  const renderStar = (index: number) => {
    const fillPercentage = Math.max(0, Math.min(1, rating - index));

    let iconName: 'star' | 'star-half' | 'star-outline';

    if (fillPercentage >= 0.75) {
      iconName = 'star';
    } else if (fillPercentage >= 0.25 && showHalfStars) {
      iconName = 'star-half';
    } else if (fillPercentage > 0 && !showHalfStars) {
      iconName = 'star';
    } else {
      iconName = 'star-outline';
    }

    const star = (
      <Ionicons
        key={index}
        name={iconName}
        size={size}
        color={iconName === 'star-outline' ? theme.colors.starEmpty : theme.colors.star}
      />
    );

    if (interactive) {
      return (
        <Pressable
          key={index}
          onPress={() => onRatingChange?.(index + 1)}
          hitSlop={8}
        >
          {star}
        </Pressable>
      );
    }

    return star;
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: maxStars }, (_, i) => renderStar(i))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 2,
  },
});
