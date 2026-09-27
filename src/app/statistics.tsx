import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { MessageScreen } from '@/components/message-screen';
import { ScoreText } from '@/components/score-text';
import { ThemedText } from '@/components/themed-text';
import { usePlayerStats } from '@/hooks/use-player-stats';
import { borders, layout, radius, spacing, useTheme } from '@/theme';
import {
  type CategoryStats,
  type DifficultyStats,
  formatScore,
  gamesLabel,
  type PlayerStats,
} from '@/utils/player-stats';
import { QUESTIONS_PER_QUIZ } from '@/utils/quiz-schema';

export default function StatisticsScreen() {
  const { colors } = useTheme();
  const state = usePlayerStats();

  if (state.status === 'loading') {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  if (!state.stats) {
    return (
      <MessageScreen
        icon={{ ios: 'chart.bar.fill', android: 'bar_chart' }}
        title="עוד אין כאן נתונים"
        message="שחקו משחק ראשון והסטטיסטיקות יתחילו להצטבר."
        actions={<Button title="לבחירת נושא" onPress={() => router.push('/categories')} />}
      />
    );
  }

  const { stats } = state;

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
      <Overview stats={stats} />
      {stats.strongestCategory && <StrongestCategory stats={stats.strongestCategory} />}
      <Section title="לפי רמת קושי">
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          {stats.byDifficulty.map((difficultyStats) => (
            <DifficultyCard key={difficultyStats.difficulty.id} stats={difficultyStats} />
          ))}
        </View>
      </Section>
      <Section title="לפי נושא">
        {stats.byCategory.map((categoryStats) => (
          <CategoryRow key={categoryStats.category.id} stats={categoryStats} />
        ))}
      </Section>
    </ScrollView>
  );
}

/** The headline numbers on one raised card: games, average and best, then the correct answers. */
function Overview({ stats }: { stats: PlayerStats }) {
  const { colors, shadows } = useTheme();
  const correct = stats.totalCorrect === 1 ? 'תשובה נכונה אחת' : `${stats.totalCorrect} תשובות נכונות`;

  return (
    <View
      style={{
        gap: spacing.xl,
        padding: spacing.xl,
        borderRadius: radius.lg,
        borderCurve: 'continuous',
        backgroundColor: colors.surface,
        boxShadow: shadows.raised,
      }}>
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Figure label="משחקים" spoken={String(stats.games)}>
          <ThemedText variant="title" style={{ fontVariant: ['tabular-nums'] }}>
            {stats.games}
          </ThemedText>
        </Figure>
        <Figure label="ממוצע" spoken={`${formatScore(stats.average)} מתוך ${QUESTIONS_PER_QUIZ}`}>
          <ScoreText score={stats.average} />
        </Figure>
        <Figure label="שיא" spoken={`${formatScore(stats.best)} מתוך ${QUESTIONS_PER_QUIZ}`}>
          <ScoreText score={stats.best} />
        </Figure>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          paddingTop: spacing.lg,
          borderTopWidth: borders.hairline,
          borderTopColor: colors.border,
        }}>
        <Icon name={{ ios: 'checkmark.circle.fill', android: 'check_circle' }} size={20} color={colors.success} />
        <ThemedText variant="headline">{`${correct} בסך הכול`}</ThemedText>
      </View>
    </View>
  );
}

type FigureProps = { label: string; spoken: string; children: ReactNode };

/** A label over a big number, read by screen readers as one "label: value" element. */
function Figure({ label, spoken, children }: FigureProps) {
  return (
    <View accessible accessibilityLabel={`${label}: ${spoken}`} style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}>
      <ThemedText variant="caption" tone="secondary">
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

/** The best-scoring category, on its own soft color. */
function StrongestCategory({ stats }: { stats: CategoryStats }) {
  const { colors, tints } = useTheme();
  const tint = tints[stats.category.tint];

  return (
    <View
      accessible
      accessibilityLabel={`הנושא החזק שלכם: ${stats.category.name}, ממוצע ${formatScore(stats.average)} מתוך ${QUESTIONS_PER_QUIZ}, ${gamesLabel(stats.games)}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
        padding: spacing.xl,
        borderRadius: radius.lg,
        borderCurve: 'continuous',
        backgroundColor: tint.background,
      }}>
      <View
        style={{
          width: 64,
          height: 64,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radius.full,
          backgroundColor: colors.surface,
        }}>
        <Icon name={stats.category.icon} size={32} color={tint.foreground} />
      </View>
      <View style={{ flex: 1, gap: spacing.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Icon name={{ ios: 'star.fill', android: 'star' }} size={14} color={tint.foreground} />
          <ThemedText variant="caption" style={{ color: tint.foreground }}>
            הנושא החזק שלכם
          </ThemedText>
        </View>
        <ThemedText variant="title" numberOfLines={2}>
          {stats.category.name}
        </ThemedText>
        <ThemedText tone="secondary">
          {`ממוצע ${formatScore(stats.average)}/${QUESTIONS_PER_QUIZ} · ${gamesLabel(stats.games)}`}
        </ThemedText>
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: spacing.md }}>
      <ThemedText variant="headline" accessibilityRole="header">
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

/** A level's games and average score. */
function DifficultyCard({ stats }: { stats: DifficultyStats }) {
  const { colors } = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${stats.difficulty.name}: ${gamesLabel(stats.games)}, ממוצע ${formatScore(stats.average)} מתוך ${QUESTIONS_PER_QUIZ}`}
      style={{
        flex: 1,
        gap: spacing.sm,
        padding: spacing.lg,
        borderRadius: radius.lg,
        borderCurve: 'continuous',
        backgroundColor: colors.surface,
        borderWidth: borders.thin,
        borderColor: colors.border,
      }}>
      <View>
        <ThemedText variant="headline">{stats.difficulty.name}</ThemedText>
        <ThemedText variant="caption" tone="secondary">
          {gamesLabel(stats.games)}
        </ThemedText>
      </View>
      <View>
        <ScoreText score={stats.average} />
        <ThemedText variant="caption" tone="secondary">
          ממוצע
        </ThemedText>
      </View>
    </View>
  );
}

/** A played category: its mark, games and best score, with the average at the end. */
function CategoryRow({ stats }: { stats: CategoryStats }) {
  const { colors, tints } = useTheme();
  const tint = tints[stats.category.tint];
  const best = `שיא ${formatScore(stats.best)}/${QUESTIONS_PER_QUIZ}`;

  return (
    <View
      accessible
      accessibilityLabel={`${stats.category.name}: ${gamesLabel(stats.games)}, ממוצע ${formatScore(stats.average)} מתוך ${QUESTIONS_PER_QUIZ}, שיא ${formatScore(stats.best)} מתוך ${QUESTIONS_PER_QUIZ}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderCurve: 'continuous',
        backgroundColor: colors.surface,
        borderWidth: borders.thin,
        borderColor: colors.border,
      }}>
      <View
        style={{
          width: 48,
          height: 48,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radius.md,
          borderCurve: 'continuous',
          backgroundColor: tint.background,
        }}>
        <Icon name={stats.category.icon} size={24} color={tint.foreground} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <ThemedText variant="headline" numberOfLines={1}>
          {stats.category.name}
        </ThemedText>
        <ThemedText variant="caption" tone="secondary">
          {`${gamesLabel(stats.games)} · ${best}`}
        </ThemedText>
      </View>
      <View style={{ alignItems: 'center' }}>
        <ScoreText score={stats.average} variant="headline" />
        <ThemedText variant="caption" tone="secondary">
          ממוצע
        </ThemedText>
      </View>
    </View>
  );
}
