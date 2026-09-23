import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { accent, danger, palette } from '@/constants/theme';
import { categories } from '@/data/categories';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MAX_TOPIC_LENGTH } from '@/utils/quiz-schema';

export default function CategoriesScreen() {
  const colors = palette[useColorScheme() === 'dark' ? 'dark' : 'light'];
  const [isCustomTopicOpen, setCustomTopicOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [topicError, setTopicError] = useState<string | null>(null);

  const handleTopicChange = (value: string) => {
    setTopic(value);
    setTopicError(null);
  };

  const handleCreateGame = () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      setTopicError('צריך לכתוב נושא כדי ליצור משחק');
      return;
    }
    router.push({ pathname: '/quiz/custom', params: { topic: trimmedTopic } });
  };

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

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="נושא משלי"
          accessibilityState={{ expanded: isCustomTopicOpen }}
          onPress={() => setCustomTopicOpen((open) => !open)}
          style={({ pressed }) => [
            styles.option,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
            pressed && styles.optionPressed,
          ]}>
          <Text style={styles.optionIcon}>✏️</Text>
          <Text style={[styles.optionLabel, { color: colors.title }]}>נושא משלי</Text>
        </Pressable>

        {isCustomTopicOpen && (
          <View style={styles.customTopic}>
            <TextInput
              accessibilityLabel="הנושא שלך"
              value={topic}
              onChangeText={handleTopicChange}
              onSubmitEditing={handleCreateGame}
              placeholder="למשל: חלל, מוזיקה ישראלית, כדורגל"
              placeholderTextColor={colors.subtitle}
              maxLength={MAX_TOPIC_LENGTH}
              returnKeyType="go"
              autoFocus
              style={[
                styles.input,
                {
                  color: colors.title,
                  backgroundColor: colors.card,
                  borderColor: topicError ? danger : colors.cardBorder,
                },
              ]}
            />
            {topicError && (
              <Text accessibilityLiveRegion="polite" style={styles.error}>
                {topicError}
              </Text>
            )}
            <Pressable
              accessibilityRole="button"
              onPress={handleCreateGame}
              style={({ pressed }) => [styles.button, pressed && styles.optionPressed]}>
              <Text style={styles.buttonLabel}>צור משחק</Text>
            </Pressable>
          </View>
        )}
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
  customTopic: {
    gap: 12,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 18,
  },
  error: {
    color: danger,
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 18,
    backgroundColor: accent,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
});
