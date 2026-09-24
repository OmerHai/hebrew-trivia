import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { ActionBar } from '@/components/action-bar';
import { Button } from '@/components/button';
import { CategoryLabel } from '@/components/category-label';
import { MessageScreen } from '@/components/message-screen';
import { ProgressTrack } from '@/components/progress-track';
import { ThemedText } from '@/components/themed-text';
import { findCategory } from '@/data/categories';
import { layout, radius, spacing, useTheme } from '@/theme';
import { decodeTrack } from '@/utils/answer-track';
import { QUESTIONS_PER_QUIZ } from '@/utils/quiz-schema';
import { resultMessage } from '@/utils/result-message';

export default function ResultsScreen() {
  const params = useLocalSearchParams<{ categoryId: string; track: string }>();
  const { colors, tints, shadows } = useTheme();
  const category = findCategory(params.categoryId);
  const results = decodeTrack(params.track, QUESTIONS_PER_QUIZ);

  if (!category || !results) {
    return (
      <MessageScreen
        icon={{ ios: 'questionmark.circle', android: 'help' }}
        title="אין תוצאות להציג"
        message="אפשר להתחיל משחק חדש מרשימת הנושאים."
        actions={<Button title="לבחירת נושא" onPress={() => router.dismissTo('/categories')} />}
      />
    );
  }

  const total = results.length;
  const score = results.filter(Boolean).length;
  const verdict = resultMessage(score, total);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: layout.gutter,
          paddingVertical: spacing.xxl,
        }}>
        <View
          style={{
            alignItems: 'center',
            gap: spacing.xxl,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.xxxl,
            borderRadius: radius.lg,
            borderCurve: 'continuous',
            backgroundColor: colors.surface,
            boxShadow: shadows.raised,
          }}>
          <View
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
              borderRadius: radius.full,
              backgroundColor: tints[category.tint].background,
            }}>
            <CategoryLabel category={category} />
          </View>

          <View style={{ alignItems: 'center', gap: spacing.xs }}>
            {/* One string, so the bidi algorithm keeps "7/10" in order inside RTL text. */}
            <ThemedText
              variant="display"
              accessibilityLabel={`${score} מתוך ${total}`}
              style={{ fontVariant: ['tabular-nums'] }}>
              {score}
              <ThemedText variant="title" tone="secondary">
                /{total}
              </ThemedText>
            </ThemedText>
            <ThemedText variant="title" accessibilityRole="header" style={{ textAlign: 'center' }}>
              {verdict.title}
            </ThemedText>
            <ThemedText tone="secondary" style={{ textAlign: 'center' }}>
              {verdict.subtitle}
            </ThemedText>
          </View>

          <ProgressTrack total={total} results={results} centered />
        </View>
      </ScrollView>

      <ActionBar divider={false}>
        <Button
          title="עוד סיבוב"
          onPress={() => router.replace({ pathname: '/quiz/[categoryId]', params: { categoryId: category.id } })}
        />
        <Button title="נושא אחר" variant="secondary" onPress={() => router.dismissTo('/categories')} />
      </ActionBar>
    </View>
  );
}
