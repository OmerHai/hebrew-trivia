import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import CategoriesScreen from '@/app/categories';
import HomeScreen from '@/app/index';
import QuizScreen from '@/app/quiz/[categoryId]';
import RootLayout from '@/app/_layout';
import { getQuestionsByCategory } from '@/data/questions';

describe('navigation', () => {
  test('start game opens the category selection screen', async () => {
    // renderRouter attaches its route helpers to the returned promise, so keep
    // a reference to it instead of the awaited value.
    const router = renderRouter({ _layout: RootLayout, index: HomeScreen, categories: CategoriesScreen });
    await router;

    await fireEvent.press(screen.getByRole('button', { name: 'התחל משחק' }));

    expect(router.getPathname()).toBe('/categories');
    expect(await screen.findByRole('header', { name: 'בחר נושא' })).toBeOnTheScreen();
  });

  test('selecting a category starts a quiz for that category', async () => {
    const router = renderRouter(
      {
        _layout: RootLayout,
        index: HomeScreen,
        categories: CategoriesScreen,
        'quiz/[categoryId]': QuizScreen,
      },
      { initialUrl: '/categories' },
    );
    await router;

    await fireEvent.press(screen.getByRole('button', { name: 'טכנולוגיה' }));

    expect(router.getPathname()).toBe('/quiz/technology');
    expect(await screen.findByText('💻 טכנולוגיה')).toBeOnTheScreen();
    expect(screen.getByText('שאלה 1 מתוך 5')).toBeOnTheScreen();
    const technologyQuestions = getQuestionsByCategory('technology').map((q) => q.question);
    expect(technologyQuestions).toContain(screen.getByRole('header').props.children);
  });
});
