import { categories, findCategory } from '@/data/categories';
import {
  categoryGenerationContexts,
  categoryReasoningEfforts,
  reasoningEffortFor,
} from '@/server/category-prompts';

const EXPECTED_CATEGORIES = [
  ['general-knowledge', 'ידע כללי'],
  ['geography', 'גאוגרפיה'],
  ['history', 'היסטוריה'],
  ['science', 'מדע'],
  ['nature-animals', 'טבע ובעלי חיים'],
  ['technology', 'טכנולוגיה'],
  ['movies', 'קולנוע'],
  ['tv-series', 'סדרות טלוויזיה'],
  ['music', 'מוזיקה'],
  ['sports', 'ספורט'],
  ['football', 'כדורגל'],
  ['food', 'אוכל'],
  ['israel', 'ישראל'],
  ['israeli-culture', 'תרבות ישראלית'],
  ['video-games', 'משחקי מחשב'],
  ['books', 'ספרים'],
  ['logic-puzzles', 'חידות היגיון'],
];

describe('predefined categories', () => {
  test('all 17 categories are present, in order, with their stable ids and Hebrew names', () => {
    expect(categories.map((category) => [category.id, category.name])).toEqual(EXPECTED_CATEGORIES);
  });

  test('category ids are unique, stable-looking English slugs', () => {
    const ids = categories.map((category) => category.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z]+(-[a-z]+)*$/);
  });

  test.each(categories)('$id has a Hebrew name and an emoji', (category) => {
    expect(category.name).toMatch(/^[א-ת ]+$/);
    expect(category.emoji).toMatch(/\p{Extended_Pictographic}|\p{Regional_Indicator}/u);
  });

  test('categories expose only player-facing fields, never the generation context', () => {
    for (const category of categories) {
      expect(Object.keys(category).sort()).toEqual(['emoji', 'id', 'name']);
    }
  });

  test('findCategory finds a category by id and nothing for anything else', () => {
    expect(findCategory('football')?.name).toBe('כדורגל');
    expect(findCategory('custom')).toBeUndefined();
    expect(findCategory(undefined)).toBeUndefined();
  });
});

describe('category generation contexts', () => {
  test('every category, and only a category, has a generation context', () => {
    expect(Object.keys(categoryGenerationContexts).sort()).toEqual(categories.map((category) => category.id).sort());
  });

  test.each(categories)('$id has a substantial, distinct generation context', (category) => {
    const context = categoryGenerationContexts[category.id];

    expect(context.trim().length).toBeGreaterThan(60);
    const others = categories.filter((other) => other.id !== category.id);
    expect(others.map((other) => categoryGenerationContexts[other.id])).not.toContain(context);
  });

  test('football is only about football, and sports steers away from football', () => {
    expect(categoryGenerationContexts.football).toMatch(/^Football \(soccer\) only/);
    expect(categoryGenerationContexts.sports).toMatch(/other than football/);
    expect(categoryGenerationContexts.sports).toMatch(/Do not ask about football/);
  });

  test('Israel and Israeli culture split facts from culture', () => {
    expect(categoryGenerationContexts.israel).toMatch(/geography/);
    expect(categoryGenerationContexts.israel).toMatch(/history/);
    expect(categoryGenerationContexts.israel).toMatch(/institutions/);
    expect(categoryGenerationContexts.israel).toMatch(/Culture and entertainment belong to the Israeli culture category/);
    expect(categoryGenerationContexts['israeli-culture']).toMatch(/music.*television.*cinema.*literature/);
    expect(categoryGenerationContexts['israeli-culture']).toMatch(/Avoid politics, history and geography/);
  });

  test('logic puzzles prioritize reasoning over factual trivia', () => {
    const context = categoryGenerationContexts['logic-puzzles'];

    expect(context).toMatch(/not factual trivia/);
    expect(context).toMatch(/Prioritize reasoning over factual recall/);
    expect(context).toMatch(/never disguise obscure trivia as logic/);
    for (const kind of ['deduction', 'sequences', 'patterns', 'lateral thinking', 'brain teaser']) {
      expect(context).toContain(kind);
    }
  });

  test.each(['israeli-culture', 'tv-series'] as const)('%s asks for high-confidence facts only', (id) => {
    expect(categoryGenerationContexts[id]).toMatch(/Prefer well-known, high-confidence facts/);
    expect(categoryGenerationContexts[id]).toMatch(/skip anything you are unsure of/);
    expect(categoryGenerationContexts[id]).toMatch(/Never invent awards, credits, creators, performers or historical facts/);
  });

  test('logic puzzles must be self-contained, unambiguous and explained step by step', () => {
    const context = categoryGenerationContexts['logic-puzzles'];

    expect(context).toMatch(/solvable using only the information in the question/);
    expect(context).toMatch(/exactly one clearly correct answer/);
    expect(context).toMatch(/Avoid ambiguous wording/);
    expect(context).toMatch(/cultural assumptions/);
    expect(context).toMatch(/explanation briefly shows the reasoning/);
  });
});

describe('category reasoning effort', () => {
  test('only Israeli culture and TV series get more reasoning', () => {
    expect(categoryReasoningEfforts).toEqual({ 'israeli-culture': 'low', 'tv-series': 'low' });
  });

  test('every other category, including logic puzzles, uses none', () => {
    const others = categories.filter((category) => !['israeli-culture', 'tv-series'].includes(category.id));

    expect(others).toHaveLength(15);
    for (const category of others) expect(reasoningEffortFor(category.id)).toBe('none');
    expect(reasoningEffortFor('logic-puzzles')).toBe('none');
    expect(reasoningEffortFor('israeli-culture')).toBe('low');
    expect(reasoningEffortFor('tv-series')).toBe('low');
  });
});
