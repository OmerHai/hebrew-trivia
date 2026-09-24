import { router, Stack, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/button';
import { CategoryLabel } from '@/components/category-label';
import { GeneratedQuiz } from '@/components/generated-quiz';
import { MessageScreen } from '@/components/message-screen';
import { findCategory } from '@/data/categories';

export default function QuizScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const category = findCategory(categoryId);

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

  return (
    <>
      <Stack.Screen options={{ title: category.name, headerTitle: () => <CategoryLabel category={category} /> }} />
      <GeneratedQuiz categoryId={category.id} />
    </>
  );
}
