import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GeneratedQuiz } from '@/components/generated-quiz';
import { palette } from '@/constants/theme';
import { findCategory } from '@/data/categories';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function QuizScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const colors = palette[useColorScheme() === 'dark' ? 'dark' : 'light'];
  const category = findCategory(categoryId);

  if (!category) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Text style={[styles.subtitle, { color: colors.subtitle }]}>לא מצאנו שאלות בנושא הזה</Text>
      </View>
    );
  }

  return <GeneratedQuiz title={`${category.emoji} ${category.name}`} categoryId={category.id} />;
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
});
