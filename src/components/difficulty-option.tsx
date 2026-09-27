import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { borders, edge, radius, spacing, useTheme } from '@/theme';
import type { Difficulty } from '@/types/difficulty';

const METER_BARS = 3;

type Props = {
  difficulty: Difficulty;
  /** Fill for the meter's active bars: the category's own color. */
  accentColor: string;
  onPress: () => void;
};

/**
 * A difficulty level as a large card: its Hebrew name, a short description and
 * a three-bar meter, with the same physical bottom edge as the game's buttons.
 */
export function DifficultyOption({ difficulty, accentColor, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={difficulty.name}
      accessibilityHint={difficulty.description}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
        minHeight: 88,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        borderRadius: radius.lg,
        borderCurve: 'continuous',
        backgroundColor: colors.surface,
        borderWidth: borders.thin,
        borderColor: colors.border,
        boxShadow: `0 ${pressed ? edge.pressed : edge.rest}px 0 ${colors.border}`,
        transform: [{ translateY: pressed ? edge.rest - edge.pressed : 0 }],
      })}>
      <View style={{ flex: 1, gap: spacing.xs }}>
        <ThemedText variant="title">{difficulty.name}</ThemedText>
        <ThemedText tone="secondary">{difficulty.description}</ThemedText>
      </View>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs }}>
        {Array.from({ length: METER_BARS }, (_, index) => (
          <View
            key={index}
            testID="difficulty-meter-bar"
            style={{
              width: 8,
              height: 12 + index * 8,
              borderRadius: radius.full,
              backgroundColor: index < difficulty.level ? accentColor : colors.track,
            }}
          />
        ))}
      </View>
    </Pressable>
  );
}
