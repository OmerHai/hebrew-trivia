import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/button';
import { CategoryLabel } from '@/components/category-label';
import { GeneratedQuiz } from '@/components/generated-quiz';
import { MessageScreen } from '@/components/message-screen';
import { findCategory } from '@/data/categories';
import { findDifficulty } from '@/data/difficulties';

export default function QuizScreen() {
  const params = useLocalSearchParams<{ categoryId: string; difficulty?: string }>();
  const category = findCategory(params.categoryId);
  const difficulty = findDifficulty(params.difficulty);

  if (!category) {
    return (
      <MessageScreen
        icon={{ ios: 'questionmark.folder', android: 'folder_off' }}
        title="לא מצאנו את הנושא הזה"
        message="אפשר לבחור נושא אחר מהרשימה."
        actions={<Button title="לבחירת נושא" onPress={() => router.dismissTo('/categories')} />}
      />
    );
  }

  if (!difficulty) {
    // E.g. an old link without a level: let the player pick one.
    return <Redirect href={{ pathname: '/difficulty/[categoryId]', params: { categoryId: category.id } }} />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: category.name,
          headerTitle: () => <CategoryLabel category={category} difficulty={difficulty} />,
        }}
      />
      <GeneratedQuiz categoryId={category.id} difficulty={difficulty.id} />
    </>
  );
}
