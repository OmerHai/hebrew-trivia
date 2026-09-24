import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { edge, radius, useTheme } from '@/theme';

/** The app's mark: a sunflower quiz key with an ink question mark. Same shape as the app icon. */
export function LogoMark({ size = 96 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.lg + size / 16,
        borderCurve: 'continuous',
        backgroundColor: colors.accent,
        boxShadow: `0 ${edge.rest * 2}px 0 ${colors.accentEdge}`,
      }}>
      <ThemedText
        variant="display"
        tone="onAccent"
        allowFontScaling={false}
        style={{ fontSize: size * 0.62, lineHeight: size * 0.75 }}>
        ?
      </ThemedText>
    </View>
  );
}
