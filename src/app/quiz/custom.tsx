import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GeneratedQuiz } from '@/components/generated-quiz';
import { palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CustomTopicQuizScreen() {
  const { topic = '' } = useLocalSearchParams<{ topic?: string }>();
  const colors = palette[useColorScheme() === 'dark' ? 'dark' : 'light'];
  const trimmedTopic = topic.trim();

  if (!trimmedTopic) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Text style={[styles.subtitle, { color: colors.subtitle }]}>לא נבחר נושא למשחק</Text>
      </View>
    );
  }

  return <GeneratedQuiz title={`✏️ ${trimmedTopic}`} request={{ topic: trimmedTopic }} />;
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
});
