import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AnswerButton, type AnswerStatus } from '@/components/answer-button';
import { accent, danger, palette, success } from '@/constants/theme';
import { categories } from '@/data/categories';
import { getQuestionsByCategory } from '@/data/questions';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useQuiz } from '@/hooks/use-quiz';
import type { Category } from '@/types/category';
import type { Question } from '@/types/question';

export default function QuizScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const colors = palette[useColorScheme() === 'dark' ? 'dark' : 'light'];
  const category = categories.find((item) => item.id === categoryId);
  const questions = category ? getQuestionsByCategory(category.id) : [];

  if (!category || questions.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Text style={[styles.subtitle, { color: colors.subtitle }]}>לא מצאנו שאלות בנושא הזה</Text>
      </View>
    );
  }

  return <Quiz category={category} questions={questions} />;
}

function Quiz({ category, questions }: { category: Category; questions: Question[] }) {
  const colors = palette[useColorScheme() === 'dark' ? 'dark' : 'light'];
  const quiz = useQuiz(questions);
  const { question, selectedIndex, isAnswered } = quiz;
  const isCorrect = selectedIndex === question.correctIndex;

  const answerStatus = (index: number): AnswerStatus => {
    if (!isAnswered) return 'idle';
    if (index === question.correctIndex) return 'correct';
    return index === selectedIndex ? 'incorrect' : 'idle';
  };

  const handleNext = () => {
    if (quiz.isLastQuestion) {
      // Replace so going back from the results doesn't return to a finished quiz.
      router.replace({ pathname: '/results', params: { score: quiz.score, total: quiz.total } });
    } else {
      quiz.nextQuestion();
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}>
      <View style={styles.meta}>
        <Text style={[styles.category, { color: colors.title }]}>
          {category.icon} {category.name}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.subtitle, { color: colors.subtitle }]}>
            שאלה {quiz.questionNumber} מתוך {quiz.total}
          </Text>
          <Text style={[styles.subtitle, { color: colors.subtitle }]}>ניקוד: {quiz.score}</Text>
        </View>
      </View>

      <Text accessibilityRole="header" style={[styles.question, { color: colors.title }]}>
        {question.question}
      </Text>

      <View style={styles.answers}>
        {question.answers.map((answer, index) => (
          <AnswerButton
            key={answer}
            label={answer}
            status={answerStatus(index)}
            disabled={isAnswered}
            onPress={() => quiz.selectAnswer(index)}
          />
        ))}
      </View>

      {isAnswered && (
        <View style={styles.footer}>
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.feedback, { color: isCorrect ? success : danger }]}>
            {isCorrect
              ? 'תשובה נכונה, כל הכבוד!'
              : `טעות. התשובה הנכונה היא: ${question.answers[question.correctIndex]}`}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={handleNext}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
            <Text style={styles.buttonLabel}>{quiz.isLastQuestion ? 'לתוצאות' : 'לשאלה הבאה'}</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 24,
  },
  meta: {
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  category: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  question: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 36,
  },
  answers: {
    gap: 12,
  },
  footer: {
    gap: 16,
  },
  feedback: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
  },
  button: {
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 18,
    backgroundColor: accent,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
});
