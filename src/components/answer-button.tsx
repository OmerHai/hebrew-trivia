import { Pressable, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { rtl } from '@/utils/bidi';
import { borders, edge, layout, maxChromeFontScale, radius, spacing, useTheme } from '@/theme';

/**
 * `correct` marks the right answer once revealed, `incorrect` the player's
 * wrong pick, and `dimmed` every other answer after the reveal.
 */
export type AnswerStatus = 'idle' | 'correct' | 'incorrect' | 'dimmed';

/** Hebrew answer letters, in reading order. */
export const ANSWER_LETTERS = ['א', 'ב', 'ג', 'ד'] as const;

const BADGE = 32;

const STATUS_VALUE: Partial<Record<AnswerStatus, string>> = {
  correct: 'התשובה הנכונה',
  incorrect: 'תשובה שגויה',
};

type Props = {
  label: string;
  letter: string;
  status: AnswerStatus;
  /** Whether the player picked this answer. */
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
};

export function AnswerButton({ label, letter, status, selected, disabled, onPress }: Props) {
  const { colors } = useTheme();
  const isCorrect = status === 'correct';
  const isIncorrect = status === 'incorrect';
  const statusFill = isCorrect ? colors.success : isIncorrect ? colors.danger : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected }}
      accessibilityValue={STATUS_VALUE[status] ? { text: STATUS_VALUE[status] } : undefined}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: layout.controlHeight + spacing.sm,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.md,
        borderCurve: 'continuous',
        borderWidth: statusFill ? borders.thick : borders.thin,
        borderColor: statusFill ?? colors.border,
        backgroundColor: isCorrect
          ? colors.successSurface
          : isIncorrect
            ? colors.dangerSurface
            : pressed
              ? colors.surfaceMuted
              : colors.surface,
        boxShadow: status === 'idle' && !pressed ? `0 ${edge.subtle}px 0 ${colors.border}` : undefined,
        transform: [{ translateY: pressed ? edge.subtle : 0 }],
        opacity: status === 'dimmed' ? 0.45 : 1,
      })}>
      <View
        style={{
          width: BADGE,
          height: BADGE,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radius.full,
          backgroundColor: statusFill ?? colors.surfaceMuted,
        }}>
        {isCorrect ? (
          <Icon name={{ ios: 'checkmark', android: 'check' }} size={18} color={colors.onStatus} />
        ) : isIncorrect ? (
          <Icon name={{ ios: 'xmark', android: 'close' }} size={16} color={colors.onStatus} />
        ) : (
          <ThemedText
            variant="headline"
            tone="secondary"
            maxFontSizeMultiplier={maxChromeFontScale}
            accessibilityElementsHidden
            importantForAccessibility="no">
            {letter}
          </ThemedText>
        )}
      </View>
      <ThemedText variant="answer" style={{ flex: 1 }}>
        {rtl(label)}
      </ThemedText>
    </Pressable>
  );
}
