import { router } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionBar } from '@/components/action-bar';
import { Button } from '@/components/button';
import { LogoMark } from '@/components/logo-mark';
import { ThemedText } from '@/components/themed-text';
import { categories } from '@/data/categories';
import { layout, radius, spacing, useTheme } from '@/theme';

// A finished game in miniature: the same track the quiz and results use.
const SAMPLE_TRACK = [true, true, false, true, true, true, false, true, true, true];

export default function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.xxl,
          paddingHorizontal: layout.gutter,
        }}>
        <LogoMark />
        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <ThemedText variant="display" accessibilityRole="header" style={{ textAlign: 'center' }}>
            טריוויה
          </ThemedText>
          <ThemedText variant="headline" tone="secondary" style={{ textAlign: 'center' }}>
            עשר שאלות. נושא אחד. כמה תדעו?
          </ThemedText>
        </View>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ flexDirection: 'row', gap: spacing.sm }}>
          {SAMPLE_TRACK.map((correct, index) => (
            <View
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: radius.full,
                backgroundColor: correct ? colors.success : colors.danger,
                opacity: 0.85,
              }}
            />
          ))}
        </View>
      </View>

      <ActionBar divider={false}>
        <Button title="בואו נשחק" onPress={() => router.push('/categories')} />
        <ThemedText variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
          {`${categories.length} נושאים · שאלות חדשות בכל סיבוב`}
        </ThemedText>
      </ActionBar>
    </View>
  );
}
