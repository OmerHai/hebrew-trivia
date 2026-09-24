import * as Haptics from 'expo-haptics';

/** A subtle success/failure tap when an answer is revealed. Native only. */
export function answerHaptic(correct: boolean) {
  const feedback =
    process.env.EXPO_OS === 'ios'
      ? Haptics.notificationAsync(
          correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
        )
      : process.env.EXPO_OS === 'android'
        ? Haptics.performAndroidHapticsAsync(correct ? Haptics.AndroidHaptics.Confirm : Haptics.AndroidHaptics.Reject)
        : null;
  // Haptics are a nicety: an unavailable engine must never break the game.
  feedback?.catch(() => {});
}
