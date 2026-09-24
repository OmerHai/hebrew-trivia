import { View } from 'react-native';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { radius, spacing, useTheme } from '@/theme';

const DOT = 10;
const CURRENT_DOT = 26;

type Props = {
  total: number;
  /** Whether each answered question was answered correctly, in order. */
  results: readonly boolean[];
  /** The question being played, or omitted once the game is over. */
  currentIndex?: number;
  /** Shows the correct-answer count after the track. */
  showScore?: boolean;
  /** Centers the dots instead of starting them at the reading edge. */
  centered?: boolean;
};

/**
 * One dot per question: green for a correct answer, red for a wrong one, a
 * wider pill for the current question. Reads as one progress element for
 * screen readers.
 */
export function ProgressTrack({ total, results, currentIndex, showScore = false, centered = false }: Props) {
  const { colors } = useTheme();
  const score = results.filter(Boolean).length;
  const correct = score === 1 ? 'תשובה נכונה אחת' : `${score} תשובות נכונות`;
  const label =
    currentIndex === undefined
      ? `${correct} מתוך ${total}`
      : `שאלה ${currentIndex + 1} מתוך ${total}, ${correct}`;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max: total, now: currentIndex === undefined ? total : currentIndex + 1 }}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: centered ? 'center' : 'flex-start',
          gap: spacing.sm,
        }}>
        {Array.from({ length: total }, (_, index) => {
          const result = results[index];
          const isCurrent = index === currentIndex;
          const color =
            result === true ? colors.success : result === false ? colors.danger : isCurrent ? colors.text : colors.track;
          return (
            <View
              key={index}
              style={{
                width: isCurrent ? CURRENT_DOT : DOT,
                height: DOT,
                borderRadius: radius.full,
                backgroundColor: color,
              }}
            />
          );
        })}
      </View>
      {showScore && (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Icon name={{ ios: 'checkmark.circle.fill', android: 'check_circle' }} size={16} color={colors.success} />
          <ThemedText variant="caption" tone="secondary" style={{ fontVariant: ['tabular-nums'] }}>
            {score}
          </ThemedText>
        </View>
      )}
    </View>
  );
}
