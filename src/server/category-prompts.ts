// Server-only: the generation instructions for each predefined category. They
// are sent to OpenAI but never to the player, so do not import this file from
// screens or components.
import type { ReasoningEffort } from 'openai/resources/shared';

import type { CategoryId } from '@/data/categories';

/**
 * What each category covers, written for the model. Neighbouring categories
 * (sports and football, Israel and Israeli culture, music and Israeli culture…)
 * say where their borders are so their questions don't overlap.
 */
export const categoryGenerationContexts = {
  'general-knowledge':
    'A broad mix of everyday general knowledge from many fields: science, history, geography, language, culture and everyday life. Keep it at the level a curious adult would enjoy and avoid specialist detail.',
  geography:
    'World geography: countries, capitals, cities, borders, landmarks, rivers, mountains, oceans, deserts, climate and maps. Cover the whole world; Israel has its own category.',
  history:
    'World history from ancient civilizations to the late 20th century: empires, wars, revolutions, famous leaders, discoveries and turning points. Mostly world history; Israeli history belongs to the Israel category.',
  science:
    'Physics, chemistry, astronomy and space, earth science, the human body and medicine, and famous scientists and discoveries. Animals and ecosystems belong to the nature category.',
  'nature-animals':
    'Animals, plants, ecosystems and habitats, animal behaviour and adaptations, the biology of living organisms and the natural world.',
  technology:
    'Computers, the internet, software, smartphones, famous technology companies and founders, inventions and the history of computing, with technical concepts kept simple. Video games have their own category.',
  movies:
    'Cinema: famous films and franchises, directors, actors, film awards such as the Oscars, genres, memorable scenes and film history, mostly international. Not TV series, and Israeli cinema belongs to the Israeli culture category.',
  'tv-series':
    'Television series: dramas, comedies, sitcoms, animated and streaming series, their characters, actors, creators and plots, mostly international. Not feature films, and Israeli TV belongs to the Israeli culture category. Prefer well-known, high-confidence facts and skip anything you are unsure of. Never invent awards, credits, creators, performers or historical facts.',
  music:
    'Music: artists, bands, songs, albums, genres, instruments, basic music theory and music history from classical to modern pop, mostly international. Israeli music belongs to the Israeli culture category.',
  sports:
    'Sports other than football (soccer): basketball, tennis, the Olympic Games, athletics, swimming, cycling, motor racing and more — famous athletes, records, rules and competitions. Do not ask about football, which has its own category.',
  football:
    'Football (soccer) only: clubs, national teams, famous players and coaches, the World Cup, the European Championship, the Champions League and national leagues, rules, stadiums and football history, including Israeli football.',
  food:
    'Food and drink: dishes and cuisines from around the world, ingredients, spices, cooking techniques, drinks, and the origins of foods and culinary traditions.',
  israel:
    'The State of Israel and the Land of Israel: geography, cities, landmarks and nature sites, history from ancient times to today, state institutions, national symbols and general facts. Culture and entertainment belong to the Israeli culture category.',
  'israeli-culture':
    'Israeli culture: Israeli music and singers, television, cinema, literature and poetry, theatre, comedy, popular culture and slang, and well-known Israeli artists. Stick to famous, widely known works and artists, and avoid details such as character names unless they are iconic. Prefer well-known, high-confidence facts and skip anything you are unsure of. Never invent awards, credits, creators, performers or historical facts. Avoid politics, history and geography.',
  'video-games':
    'Video games: famous games and franchises, characters, consoles and platforms, game studios and designers, gaming history and esports.',
  books:
    'Books and literature: famous novels, authors and poets, literary characters, classics, children’s books, fantasy and best-sellers, mostly world literature. Israeli literature belongs to the Israeli culture category.',
  'logic-puzzles': [
    'Logic puzzles and brain teasers, not factual trivia. Each question is a short, self-contained puzzle: deduction, number or letter sequences, patterns, simple arithmetic reasoning, lateral thinking or a classic brain teaser.',
    'Prioritize reasoning over factual recall: never rely on outside knowledge beyond everyday basics, and never disguise obscure trivia as logic.',
    'Every puzzle must be solvable using only the information in the question. There must be exactly one clearly correct answer, and the other three must be definitely wrong. Solve each puzzle yourself and check the solution before writing the answers.',
    'Avoid ambiguous wording, wordplay that only works in English, and puzzles that depend on cultural assumptions.',
    'A question may take two or three short sentences when the puzzle needs a setup.',
    'The explanation briefly shows the reasoning that leads to the answer, in up to 30 words.',
  ].join(' '),
} satisfies Record<CategoryId, string>;

/** The reasoning effort for categories without an override, and for free-text topics: fastest. */
export const DEFAULT_REASONING_EFFORT: ReasoningEffort = 'none';

/**
 * Categories that get more reasoning because their questions were noticeably
 * less accurate without it. More reasoning costs first-question latency, so
 * keep this list short.
 */
export const categoryReasoningEfforts: Partial<Record<CategoryId, ReasoningEffort>> = {
  'israeli-culture': 'low',
  'tv-series': 'low',
};

export function reasoningEffortFor(categoryId: CategoryId): ReasoningEffort {
  return categoryReasoningEfforts[categoryId] ?? DEFAULT_REASONING_EFFORT;
}
