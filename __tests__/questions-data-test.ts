import { categories } from '@/data/categories';
import { getQuestionsByCategory, questions } from '@/data/questions';

describe('question bank', () => {
  test.each(categories.map((category) => [category.name, category.id]))(
    '%s has five questions',
    (_name, categoryId) => {
      expect(getQuestionsByCategory(categoryId)).toHaveLength(5);
    },
  );

  test('every question belongs to an existing category', () => {
    const categoryIds = categories.map((category) => category.id);

    for (const question of questions) {
      expect(categoryIds).toContain(question.categoryId);
    }
  });

  test('question ids are unique', () => {
    const ids = questions.map((question) => question.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  test('every question has four distinct answers and a valid correct answer', () => {
    for (const question of questions) {
      expect(question.answers).toHaveLength(4);
      expect(new Set(question.answers).size).toBe(4);
      expect(question.answers[question.correctIndex]).toBeDefined();
    }
  });
});
