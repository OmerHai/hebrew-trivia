import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { palette } from '@/constants/theme';
import { categories } from '@/data/categories';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CategoriesScreen() {
  const colors = palette[useColorScheme() === 'dark' ? 'dark' : 'light'];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}>
      <View style={styles.intro}>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.title }]}>
          בחר נושא
        </Text>
        <Text style={[styles.subtitle, { color: colors.subtitle }]}>על מה נשחק הפעם?</Text>
      </View>

      <View style={styles.list}>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            accessibilityRole="button"
            accessibilityLabel={category.name}
            onPress={() =>
              router.push({ pathname: '/quiz/[categoryId]', params: { categoryId: category.id } })
            }
            style={({ pressed }) => [
              styles.option,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
              pressed && styles.optionPressed,
            ]}>
            <Text style={styles.optionIcon}>{category.icon}</Text>
            <Text style={[styles.optionLabel, { color: colors.title }]}>{category.name}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 28,
  },
  intro: {
    gap: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
  },
  list: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  optionPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  optionIcon: {
    fontSize: 28,
  },
  optionLabel: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
  },
});
