import { ThemedText } from '@/components/themed-text';
import type { TypeVariant } from '@/theme';
import { formatScore } from '@/utils/player-stats';
import { QUESTIONS_PER_QUIZ } from '@/utils/quiz-schema';

type Props = {
  /** Out of `QUESTIONS_PER_QUIZ`. */
  score: number;
  variant?: TypeVariant;
  /** The quieter "/10" after the score. */
  suffixVariant?: TypeVariant;
};

/**
 * A score such as "7.2/10". One text run, so the bidi algorithm keeps it in
 * order inside right-to-left text, with the "/10" quieter than the score.
 */
export function ScoreText({ score, variant = 'title', suffixVariant = 'caption' }: Props) {
  const value = formatScore(score);
  return (
    <ThemedText
      variant={variant}
      accessibilityLabel={`${value} מתוך ${QUESTIONS_PER_QUIZ}`}
      style={{ fontVariant: ['tabular-nums'] }}>
      {value}
      <ThemedText variant={suffixVariant} tone="secondary">
        /{QUESTIONS_PER_QUIZ}
      </ThemedText>
    </ThemedText>
  );
}
