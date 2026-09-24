import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { ActionBar } from '@/components/action-bar';
import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { layout, radius, spacing, useTheme } from '@/theme';

type Props = {
  icon: IconName;
  title: string;
  message: string;
  /** Buttons, shown in the bottom action bar. */
  actions: ReactNode;
};

/** A calm full-screen message (errors, missing content) with its actions at the bottom. */
export function MessageScreen({ icon, title, message, actions }: Props) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.lg,
          paddingHorizontal: layout.gutter,
          paddingVertical: spacing.xxxl,
        }}>
        <View
          style={{
            width: 72,
            height: 72,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.full,
            backgroundColor: colors.surfaceMuted,
          }}>
          <Icon name={icon} size={32} color={colors.textSecondary} />
        </View>
        <View accessibilityLiveRegion="polite" style={{ gap: spacing.sm, alignItems: 'center' }}>
          <ThemedText variant="title" accessibilityRole="header" style={{ textAlign: 'center' }}>
            {title}
          </ThemedText>
          <ThemedText selectable tone="secondary" style={{ textAlign: 'center' }}>
            {message}
          </ThemedText>
        </View>
      </ScrollView>
      <ActionBar divider={false}>{actions}</ActionBar>
    </View>
  );
}
