import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AnswerButton, type AnswerStatus } from '@/components/answer-button';
import { accent, danger, palette, success } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGeneratedQuiz } from '@/hooks/use-generated-quiz';
import { useQuiz } from '@/hooks/use-quiz';
import type { Question } from '@/types/question';
import type { QuizErrorKind } from '@/utils/quiz-api';
import type { QuizRequest } from '@/utils/quiz-schema';

const ERROR_MESSAGES: Record<QuizErrorKind, string> = {
  network: 'לא הצלחנו להתחבר. כדאי לבדוק את החיבור לאינטרנט ולנסות שוב.',
  refused: 'לא הצלחנו ליצור שאלות על הנושא הזה. אפשר לנסות שוב או לבחור נושא אחר.',
  failed: 'משהו השתבש בהכנת המשחק. כדאי לנסות שוב בעוד רגע.',
};

type Props = {
  /** Heading shown above the quiz, e.g. the category icon and name. */
  title: string;
  request: QuizRequest;
};

/** Requests a freshly generated quiz and lets the player play it. */
export function GeneratedQuiz({ title, request }: Props) {
  const colors = palette[useColorScheme() === 'dark' ? 'dark' : 'light'];
  const quiz = useGeneratedQuiz(request);

  if (quiz.status === 'loading') {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={accent} />
        <Text accessibilityLiveRegion="polite" style={[styles.subtitle, styles.centeredText, { color: colors.subtitle }]}>
          מכינים לך שאלות חדשות…
        </Text>
      </View>
    );
  }

  if (quiz.status === 'error') {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text accessibilityRole="header" style={[styles.category, styles.centeredText, { color: colors.title }]}>
          אופס!
        </Text>
        <Text style={[styles.subtitle, styles.centeredText, { color: colors.subtitle }]}>
          {ERROR_MESSAGES[quiz.error]}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={quiz.retry}
          style={({ pressed }) => [styles.button, styles.retryButton, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonLabel}>נסה שוב</Text>
        </Pressable>
      </View>
    );
  }

  return <Quiz title={title} questions={quiz.questions} />;
}

function Quiz({ title, questions }: { title: string; questions: Question[] }) {
  const colors = palette[useColorScheme() === 'dark' ? 'dark' : 'light'];
  const quiz = useQuiz(questions);
  const { question, selectedIndex, isAnswered } = quiz;
  const isCorrect = selectedIndex === question.correctAnswerIndex;

  const answerStatus = (index: number): AnswerStatus => {
    if (!isAnswered) return 'idle';
    if (index === question.correctAnswerIndex) return 'correct';
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
        <Text style={[styles.category, { color: colors.title }]}>{title}</Text>
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
          <View accessibilityLiveRegion="polite" style={styles.feedbackGroup}>
            <Text style={[styles.feedback, { color: isCorrect ? success : danger }]}>
              {isCorrect
                ? 'תשובה נכונה, כל הכבוד!'
                : `טעות. התשובה הנכונה היא: ${question.answers[question.correctAnswerIndex]}`}
            </Text>
            <Text style={[styles.subtitle, { color: colors.subtitle }]}>{question.explanation}</Text>
          </View>
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  centeredText: {
    textAlign: 'center',
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
  feedbackGroup: {
    gap: 6,
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
  retryButton: {
    alignSelf: 'stretch',
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
