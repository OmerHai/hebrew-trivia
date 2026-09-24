import { View } from 'react-native';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { spacing, useTheme } from '@/theme';
import type { Category } from '@/types/category';

/** The category's icon, in its own color, next to its name. Used as the quiz header title. */
export function CategoryLabel({ category }: { category: Category }) {
  const { tints } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      <Icon name={category.icon} size={20} color={tints[category.tint].foreground} />
      <ThemedText variant="headline" numberOfLines={1}>
        {category.name}
      </ThemedText>
    </View>
  );
}
