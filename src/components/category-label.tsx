import { View } from 'react-native';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { spacing, useTheme } from '@/theme';
import type { Category } from '@/types/category';
import type { Difficulty } from '@/types/difficulty';

type Props = {
  category: Category;
  /** Shown quietly after the name, once the player has picked a level. */
  difficulty?: Difficulty;
};

/** The category's icon, in its own color, next to its name. Used as the quiz header title. */
export function CategoryLabel({ category, difficulty }: Props) {
  const { tints } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      <Icon name={category.icon} size={20} color={tints[category.tint].foreground} />
      <ThemedText variant="headline" numberOfLines={1} style={{ flexShrink: 1 }}>
        {category.name}
      </ThemedText>
      {difficulty && (
        <>
          <ThemedText tone="secondary" accessibilityElementsHidden importantForAccessibility="no">
            ·
          </ThemedText>
          <ThemedText tone="secondary" numberOfLines={1} accessibilityLabel={`רמת קושי: ${difficulty.name}`}>
            {difficulty.name}
          </ThemedText>
        </>
      )}
    </View>
  );
}
