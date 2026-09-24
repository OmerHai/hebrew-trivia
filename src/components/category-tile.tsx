import { Pressable } from 'react-native';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { radius, spacing, useTheme } from '@/theme';
import type { Category } from '@/types/category';

type Props = {
  category: Category;
  onPress: () => void;
};

/** A category in the game menu: its own soft color, a native icon and the Hebrew name. */
export function CategoryTile({ category, onPress }: Props) {
  const { tints, colors } = useTheme();
  const tint = tints[category.tint];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={category.name}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        // Fits a two-line name at the default text size, so every row matches.
        minHeight: 128,
        justifyContent: 'space-between',
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: radius.lg,
        borderCurve: 'continuous',
        backgroundColor: tint.background,
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}>
      <Icon name={category.icon} size={30} color={tint.foreground} />
      <ThemedText variant="headline" numberOfLines={2} style={{ color: colors.text }}>
        {category.name}
      </ThemedText>
    </Pressable>
  );
}
