import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { borders, edge, layout, maxChromeFontScale, radius, spacing, useTheme } from '@/theme';

type Variant = 'primary' | 'secondary';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * A full-width game button with a physical bottom edge that sinks when pressed.
 * Primary is the sunflower key; secondary is a quiet neutral one.
 */
export function Button({ title, onPress, variant = 'primary', disabled = false, style }: Props) {
  const { colors } = useTheme();
  const isPrimary = variant === 'primary';
  const fill = isPrimary ? colors.accent : colors.surface;
  const edgeColor = isPrimary ? colors.accentEdge : colors.border;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: layout.controlHeight,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
          borderRadius: radius.md,
          borderCurve: 'continuous',
          backgroundColor: fill,
          borderWidth: isPrimary ? 0 : borders.thin,
          borderColor: colors.border,
          boxShadow: `0 ${pressed ? edge.pressed : edge.rest}px 0 ${edgeColor}`,
          transform: [{ translateY: pressed ? edge.rest - edge.pressed : 0 }],
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}>
      <ThemedText
        variant="headline"
        tone={isPrimary ? 'onAccent' : 'primary'}
        maxFontSizeMultiplier={maxChromeFontScale}
        style={{ textAlign: 'center' }}>
        {title}
      </ThemedText>
    </Pressable>
  );
}
