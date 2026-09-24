import { useEffect } from 'react';
import { View, type DimensionValue } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { ProgressTrack } from '@/components/progress-track';
import { ThemedText } from '@/components/themed-text';
import { QUIZ_CONTENT_STYLE } from '@/components/quiz-layout';
import { layout, motion, radius, spacing, useTheme } from '@/theme';

/** A placeholder shaped like the quiz screen, shown while the first questions are generated. */
export function QuizSkeleton({ total, message }: { total: number; message: string }) {
  const { colors } = useTheme();
  const opacity = useSharedValue(1);

  // A slow, gentle pulse. Reanimated skips it when the system asks for reduced motion.
  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.55, { duration: motion.slow }), -1, true);
  }, [opacity]);

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const block = (width: DimensionValue, height: number) => ({
    width,
    height,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={QUIZ_CONTENT_STYLE}>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <ProgressTrack total={total} results={[]} />
        </View>
        <ThemedText accessibilityLiveRegion="polite" tone="secondary">
          {message}
        </ThemedText>
        <Animated.View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[{ gap: spacing.xxl }, pulse]}>
          <View style={{ gap: spacing.md }}>
            <View style={block('100%', 24)} />
            <View style={block('70%', 24)} />
          </View>
          <View style={{ gap: spacing.md }}>
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={{ ...block('100%', layout.controlHeight + spacing.sm), borderRadius: radius.md }}
              />
            ))}
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
