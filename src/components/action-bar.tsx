import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { borders, layout, motion, spacing, useTheme } from '@/theme';

type Props = PropsWithChildren<{
  /** Fade in, for a bar that appears in response to an action. */
  animated?: boolean;
  /** Draw a hairline above the bar, for when content scrolls behind it. */
  divider?: boolean;
}>;

/**
 * The bottom action area: always reachable, clear of the home indicator, and
 * never pushed off screen by long content above it.
 */
export function ActionBar({ children, animated = false, divider = true }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const Container = animated ? Animated.View : View;

  return (
    <Container
      entering={animated ? FadeIn.duration(motion.base) : undefined}
      style={{
        gap: spacing.md,
        paddingHorizontal: layout.gutter,
        paddingTop: spacing.lg,
        paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.xs,
        backgroundColor: colors.background,
        borderTopWidth: divider ? borders.hairline : 0,
        borderTopColor: colors.border,
      }}>
      {children}
    </Container>
  );
}
