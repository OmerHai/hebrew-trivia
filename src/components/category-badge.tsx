import { View } from 'react-native';

import { CategoryLabel } from '@/components/category-label';
import { radius, spacing, useTheme } from '@/theme';
import type { Category } from '@/types/category';
import type { Difficulty } from '@/types/difficulty';

type Props = {
  category: Category;
  difficulty?: Difficulty;
};

/** The category label on a capsule of the category's soft color. */
export function CategoryBadge({ category, difficulty }: Props) {
  const { tints } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
        backgroundColor: tints[category.tint].background,
      }}>
      <CategoryLabel category={category} difficulty={difficulty} />
    </View>
  );
}
