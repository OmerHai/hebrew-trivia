import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/button';
import { CategoryBadge } from '@/components/category-badge';
import { DifficultyOption } from '@/components/difficulty-option';
import { MessageScreen } from '@/components/message-screen';
import { findCategory } from '@/data/categories';
import { difficulties } from '@/data/difficulties';
import { layout, spacing, useTheme } from '@/theme';

export default function DifficultyScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { colors, tints } = useTheme();
  const category = findCategory(categoryId);

  if (!category) {
    return (
      <MessageScreen
        icon={{ ios: 'questionmark.folder', android: 'folder_off' }}
        title="לא מצאנו את הנושא הזה"
        message="אפשר לבחור נושא אחר מהרשימה."
        actions={<Button title="לבחירת נושא" onPress={() => router.dismissTo('/categories')} />}
      />
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        gap: spacing.xxl,
        paddingHorizontal: layout.gutter,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xxxl,
      }}>
      <View style={{ alignItems: 'flex-start' }}>
        <CategoryBadge category={category} />
      </View>
      <View style={{ gap: spacing.md }}>
        {difficulties.map((difficulty) => (
          <DifficultyOption
            key={difficulty.id}
            difficulty={difficulty}
            accentColor={tints[category.tint].foreground}
            onPress={() =>
              router.push({
                pathname: '/quiz/[categoryId]',
                params: { categoryId: category.id, difficulty: difficulty.id },
              })
            }
          />
        ))}
      </View>
    </ScrollView>
  );
}
