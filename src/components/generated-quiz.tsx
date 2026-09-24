import { router, useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Alert, ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ActionBar } from '@/components/action-bar';
import { ANSWER_LETTERS, AnswerButton, type AnswerStatus } from '@/components/answer-button';
import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { MessageScreen } from '@/components/message-screen';
import { ProgressTrack } from '@/components/progress-track';
import { QUIZ_CONTENT_STYLE } from '@/components/quiz-layout';
import { QuizSkeleton } from '@/components/quiz-skeleton';
import { ThemedText } from '@/components/themed-text';
import { useGeneratedQuiz } from '@/hooks/use-generated-quiz';
import { useQuiz } from '@/hooks/use-quiz';
import { motion, radius, spacing, useTheme } from '@/theme';
import type { Question } from '@/types/question';
import { encodeTrack } from '@/utils/answer-track';
import { rtl } from '@/utils/bidi';
import { answerHaptic } from '@/utils/haptics';
import type { QuizErrorKind } from '@/utils/quiz-api';
import { QUESTIONS_PER_QUIZ } from '@/utils/quiz-schema';

const ERROR_MESSAGES: Record<QuizErrorKind, string> = {
  network: 'לא הצלחנו להתחבר. כדאי לבדוק את החיבור לאינטרנט ולנסות שוב.',
  refused: 'לא הצלחנו ליצור שאלות על הנושא הזה. אפשר לנסות שוב או לבחור נושא אחר.',
  failed: 'לא הצלחנו להכין את המשחק. כדאי לנסות שוב בעוד רגע.',
};

export const LOADING_MESSAGE = 'מכינים שאלות חדשות…';
export const WAITING_MESSAGE = 'מכינים עוד שאלות…';

/** How much of the feedback panel to bring into view after answering. */
const FEEDBACK_PEEK = 120;

type Props = { categoryId: string };

/** Requests a freshly generated quiz for the category and lets the player play it. */
export function GeneratedQuiz({ categoryId }: Props) {
  const quiz = useGeneratedQuiz(categoryId);

  if (quiz.status === 'loading') {
    return <QuizSkeleton total={QUESTIONS_PER_QUIZ} message={LOADING_MESSAGE} />;
  }

  if (quiz.status === 'error') {
    return <ErrorState error={quiz.error} onRetry={quiz.retry} onChooseTopic={() => router.dismissTo('/categories')} />;
  }

  return (
    <Quiz
      categoryId={categoryId}
      questions={quiz.questions}
      total={quiz.total}
      backgroundError={quiz.backgroundError}
      onRetry={quiz.retry}
    />
  );
}

type ErrorStateProps = { error: QuizErrorKind; onRetry: () => void; onChooseTopic: () => void };

function ErrorState({ error, onRetry, onChooseTopic }: ErrorStateProps) {
  return (
    <MessageScreen
      icon={
        error === 'network'
          ? { ios: 'wifi.exclamationmark', android: 'wifi_off' }
          : { ios: 'exclamationmark.circle', android: 'error' }
      }
      title="משהו לא עבד"
      message={ERROR_MESSAGES[error]}
      actions={
        <>
          <Button title="לנסות שוב" onPress={onRetry} />
          <Button title="לבחור נושא אחר" variant="secondary" onPress={onChooseTopic} />
        </>
      }
    />
  );
}

/** Asks before discarding a game in progress. */
function confirmLeave(onLeave: () => void) {
  const title = 'לצאת מהמשחק?';
  const message = 'ההתקדמות בסיבוב הזה לא תישמר.';
  if (process.env.EXPO_OS === 'web') {
    // react-native-web has no Alert.
    if (window.confirm(`${title}\n${message}`)) onLeave();
    return;
  }
  Alert.alert(title, message, [
    { text: 'להמשיך לשחק', style: 'cancel' },
    { text: 'לצאת', style: 'destructive', onPress: onLeave },
  ]);
}

type QuizProps = {
  categoryId: string;
  /** The questions ready so far. */
  questions: Question[];
  total: number;
  /** Set when loading the rest of the questions failed. */
  backgroundError: QuizErrorKind | null;
  onRetry: () => void;
};

function Quiz({ categoryId, questions, total, backgroundError, onRetry }: QuizProps) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const quiz = useQuiz(questions, total);
  const { question, questionIndex, selectedIndex, isAnswered, results } = quiz;
  // Where the player is heading once they leave on purpose; no confirmation then.
  const [exit, setExit] = useState<'results' | 'categories' | null>(null);

  usePreventRemove(results.length > 0 && exit === null, ({ data }) =>
    confirmLeave(() => navigation.dispatch(data.action)),
  );

  useEffect(() => {
    if (exit === 'results') {
      // Replace so going back from the results doesn't return to a finished quiz.
      router.replace({ pathname: '/results', params: { categoryId, track: encodeTrack(results) } });
    } else if (exit === 'categories') {
      router.dismissTo('/categories');
    }
  }, [exit, categoryId, results]);

  const scrollRef = useRef<ScrollView>(null);
  const viewport = useRef({ height: 0, scrollY: 0, answersTop: 0 });

  // Each new question starts at the top.
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [questionIndex]);

  /**
   * When the feedback would appear below the fold, scrolls just enough to show
   * its heading, but never past the top of the answers: seeing which answer was
   * right matters more than reading the explanation right away.
   */
  const revealFeedback = (top: number) => {
    const { height, scrollY, answersTop } = viewport.current;
    const target = Math.min(top + FEEDBACK_PEEK - height, answersTop - spacing.lg);
    if (height > 0 && target > scrollY) scrollRef.current?.scrollTo({ y: target, animated: true });
  };

  // The player is ahead of the questions that have arrived so far.
  if (!question && backgroundError) {
    return <ErrorState error={backgroundError} onRetry={onRetry} onChooseTopic={() => setExit('categories')} />;
  }

  const isCorrect = selectedIndex === question?.correctAnswerIndex;

  const answerStatus = (index: number): AnswerStatus => {
    if (!isAnswered || !question) return 'idle';
    if (index === question.correctAnswerIndex) return 'correct';
    return index === selectedIndex ? 'incorrect' : 'dimmed';
  };

  const handleAnswer = (index: number) => {
    if (!question || isAnswered) return;
    const correct = index === question.correctAnswerIndex;
    quiz.selectAnswer(index);
    answerHaptic(correct);
    AccessibilityInfo.announceForAccessibility(
      correct ? 'נכון!' : `לא הפעם. התשובה הנכונה: ${question.answers[question.correctAnswerIndex]}`,
    );
  };

  const handleNext = () => {
    if (quiz.isLastQuestion) setExit('results');
    else quiz.nextQuestion();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        ref={scrollRef}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={QUIZ_CONTENT_STYLE}
        scrollEventThrottle={64}
        onLayout={(event) => (viewport.current.height = event.nativeEvent.layout.height)}
        onScroll={(event) => (viewport.current.scrollY = event.nativeEvent.contentOffset.y)}>
        <ProgressTrack total={quiz.total} results={results} currentIndex={questionIndex} showScore />

        {question ? (
          <>
            <ThemedText variant="question" accessibilityRole="header">
              {rtl(question.question)}
            </ThemedText>

            <View
              onLayout={(event) => (viewport.current.answersTop = event.nativeEvent.layout.y)}
              style={{ gap: spacing.md }}>
              {question.answers.map((answer, index) => (
                <AnswerButton
                  key={answer}
                  label={answer}
                  letter={ANSWER_LETTERS[index]}
                  status={answerStatus(index)}
                  selected={index === selectedIndex}
                  disabled={isAnswered}
                  onPress={() => handleAnswer(index)}
                />
              ))}
            </View>

            {isAnswered && (
              <Animated.View
                entering={FadeIn.duration(motion.base)}
                onLayout={(event) => revealFeedback(event.nativeEvent.layout.y)}
                style={{
                  gap: spacing.sm,
                  padding: spacing.lg,
                  borderRadius: radius.lg,
                  borderCurve: 'continuous',
                  backgroundColor: colors.surfaceMuted,
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Icon
                    name={
                      isCorrect
                        ? { ios: 'checkmark.circle.fill', android: 'check_circle' }
                        : { ios: 'xmark.circle.fill', android: 'cancel' }
                    }
                    size={22}
                    color={isCorrect ? colors.success : colors.danger}
                  />
                  <ThemedText variant="headline" tone={isCorrect ? 'success' : 'danger'}>
                    {isCorrect ? 'נכון!' : 'לא הפעם'}
                  </ThemedText>
                </View>
                <ThemedText selectable>{rtl(question.explanation)}</ThemedText>
              </Animated.View>
            )}
          </>
        ) : (
          // Continues on its own once the rest of the questions arrive.
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg }}>
            <ActivityIndicator color={colors.textSecondary} />
            <ThemedText accessibilityLiveRegion="polite" tone="secondary">
              {WAITING_MESSAGE}
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {isAnswered && (
        <ActionBar animated>
          <Button title={quiz.isLastQuestion ? 'לתוצאות' : 'לשאלה הבאה'} onPress={handleNext} />
        </ActionBar>
      )}
    </View>
  );
}
