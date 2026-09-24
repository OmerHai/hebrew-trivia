import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { CategoryTile } from '@/components/category-tile';
import { categories } from '@/data/categories';
import { layout, spacing, useTheme } from '@/theme';

/** The categories in rows of two, in reading order (right to left). */
const rows = Array.from({ length: Math.ceil(categories.length / 2) }, (_, row) =>
  categories.slice(row * 2, row * 2 + 2),
);

export default function CategoriesScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        gap: spacing.md,
        paddingHorizontal: layout.gutter,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xxxl,
      }}>
      {rows.map((row) => (
        <View key={row[0].id} style={{ flexDirection: 'row', gap: spacing.md }}>
          {row.map((category) => (
            <CategoryTile
              key={category.id}
              category={category}
              onPress={() => router.push({ pathname: '/quiz/[categoryId]', params: { categoryId: category.id } })}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
