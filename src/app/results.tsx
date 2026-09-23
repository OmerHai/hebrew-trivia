import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Placeholder until the dedicated results screen is built.
export default function ResultsScreen() {
  const { score, total } = useLocalSearchParams<{ score: string; total: string }>();
  const colors = palette[useColorScheme() === 'dark' ? 'dark' : 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.title }]}>
        סיימת!
      </Text>
      <Text style={[styles.score, { color: colors.subtitle }]}>
        ענית נכון על {score} מתוך {total} שאלות
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
  },
  score: {
    fontSize: 20,
    textAlign: 'center',
  },
});
