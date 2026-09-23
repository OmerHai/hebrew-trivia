import { Pressable, StyleSheet, Text } from 'react-native';

import { danger, palette, success } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type AnswerStatus = 'idle' | 'correct' | 'incorrect';

type Props = {
  label: string;
  status: AnswerStatus;
  disabled: boolean;
  onPress: () => void;
};

export function AnswerButton({ label, status, disabled, onPress }: Props) {
  const colors = palette[useColorScheme() === 'dark' ? 'dark' : 'light'];
  const statusStyle =
    status === 'correct'
      ? { backgroundColor: colors.correctCard, borderColor: success }
      : status === 'incorrect'
        ? { backgroundColor: colors.incorrectCard, borderColor: danger }
        : { backgroundColor: colors.card, borderColor: colors.cardBorder };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.answer, statusStyle, pressed && styles.answerPressed]}>
      <Text style={[styles.label, { color: colors.title }]}>{label}</Text>
      {status !== 'idle' && (
        <Text style={[styles.mark, { color: status === 'correct' ? success : danger }]}>
          {status === 'correct' ? '✓' : '✗'}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  answer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  answerPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  label: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
  },
  mark: {
    fontSize: 22,
    fontWeight: '800',
  },
});
