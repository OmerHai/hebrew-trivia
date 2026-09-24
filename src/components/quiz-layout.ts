import type { ViewStyle } from 'react-native';

import { layout, spacing } from '@/theme';

/** Content padding and rhythm shared by the quiz and its skeleton, so loading doesn't jump. */
export const QUIZ_CONTENT_STYLE: ViewStyle = {
  gap: spacing.xxl,
  paddingHorizontal: layout.gutter,
  paddingTop: spacing.lg,
  paddingBottom: spacing.xxxl,
};
