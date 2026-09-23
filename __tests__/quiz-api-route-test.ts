/**
 * @jest-environment node
 */
import { POST } from '@/app/api/quiz+api';

// Replace the OpenAI client so tests never reach the real API.
const mockParse = jest.fn();
jest.mock('openai', () => {
  const actual = jest.requireActual('openai');
  const OpenAI = jest.fn(() => ({ responses: { parse: mockParse } }));
  Object.assign(OpenAI, { APIError: actual.APIError });
  return { __esModule: true, ...actual, default: OpenAI };
});

const { APIConnectionError, APIError } = jest.requireActual('openai');

const TEST_KEY = 'sk-test-secret-key';

const generatedQuestions = Array.from({ length: 5 }, (_, index) => ({
  question: `שאלה מספר ${index + 1}?`,
  answers: ['א', 'ב', 'ג', 'ד'],
  correctAnswerIndex: index % 4,
  explanation: 'הסבר קצר.',
}));

function parsedResponse(questions: unknown[] | null) {
  return {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: '{}' }] }],
    output_parsed: questions && { questions },
  };
}

function quizRequest(body: unknown) {
  return new Request('http://localhost/api/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/quiz', () => {
  const originalKey = process.env.OPENAI_API_KEY;
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = TEST_KEY;
    mockParse.mockReset();
    mockParse.mockResolvedValue(parsedResponse(generatedQuestions));
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Nothing the server logs may contain the API key.
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(TEST_KEY);
    consoleError.mockRestore();
  });

  afterAll(() => {
    process.env.OPENAI_API_KEY = originalKey;
  });

  test('generates a quiz for an existing category with structured outputs', async () => {
    const response = await POST(quizRequest({ categoryId: 'geography' }));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.questions).toHaveLength(5);
    expect(body.questions.map((q: { id: string }) => q.id)).toEqual(['q1', 'q2', 'q3', 'q4', 'q5']);
    expect(body.questions[1]).toEqual({ id: 'q2', ...generatedQuestions[1] });

    const params = mockParse.mock.calls[0][0];
    expect(params.model).toBe('gpt-6-luna');
    expect(params.input).toContain('גאוגרפיה');
    expect(params.text.format).toMatchObject({ type: 'json_schema', name: 'trivia_quiz', strict: true });
  });

  test('the output schema requires Hebrew questions and explanations and non-empty answers', async () => {
    await POST(quizRequest({ categoryId: 'geography' }));

    const { schema } = mockParse.mock.calls[0][0].text.format;
    const question = schema.properties.questions.items;
    expect(question.properties.question.pattern).toBe('[א-ת]');
    expect(question.properties.explanation.pattern).toBe('[א-ת]');
    expect(question.properties.answers.items.pattern).toBe('\\S');
  });

  test('generates a quiz for a trimmed custom topic', async () => {
    const response = await POST(quizRequest({ topic: '  חלל  ' }));

    expect(response.status).toBe(200);
    expect(mockParse.mock.calls[0][0].input).toBe('הנושא: חלל');
  });

  test.each([
    ['an empty topic', { topic: '' }],
    ['a whitespace-only topic', { topic: '   ' }],
    ['a too-long topic', { topic: 'א'.repeat(61) }],
    ['a non-string topic', { topic: 42 }],
    ['an unknown category', { categoryId: 'unknown' }],
    ['an empty body', {}],
    ['invalid JSON', 'not json'],
  ])('rejects %s without calling OpenAI', async (_case, body) => {
    const response = await POST(quizRequest(body));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'invalid_request' });
    expect(mockParse).not.toHaveBeenCalled();
  });

  test('an OpenAI API error returns a generic error without raw details', async () => {
    mockParse.mockRejectedValue(
      new APIError(429, { message: 'Rate limit reached for org-secret' }, 'Rate limit reached', new Headers()),
    );

    const response = await POST(quizRequest({ categoryId: 'technology' }));

    expect(response.status).toBe(502);
    const text = await response.text();
    expect(JSON.parse(text)).toEqual({ error: 'unavailable' });
    expect(text).not.toContain('Rate limit');
    expect(mockParse).toHaveBeenCalledTimes(1);
  });

  test('a network failure reaching OpenAI returns a generic error without another attempt', async () => {
    // The SDK already retries connection errors itself.
    mockParse.mockRejectedValue(new APIConnectionError({ message: 'Connection error.' }));

    const response = await POST(quizRequest({ categoryId: 'technology' }));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: 'unavailable' });
    expect(mockParse).toHaveBeenCalledTimes(1);
  });

  test('an invalid quiz is retried once and the valid retry is returned', async () => {
    mockParse
      .mockResolvedValueOnce(parsedResponse([generatedQuestions[1], ...generatedQuestions.slice(1)]))
      .mockResolvedValueOnce(parsedResponse(generatedQuestions));

    const response = await POST(quizRequest({ categoryId: 'geography' }));

    expect(response.status).toBe(200);
    expect((await response.json()).questions).toHaveLength(5);
    expect(mockParse).toHaveBeenCalledTimes(2);
  });

  test('output that fails schema parsing is retried once', async () => {
    mockParse
      .mockRejectedValueOnce(new SyntaxError('Unexpected end of JSON input'))
      .mockResolvedValueOnce(parsedResponse(generatedQuestions));

    const response = await POST(quizRequest({ categoryId: 'geography' }));

    expect(response.status).toBe(200);
    expect(mockParse).toHaveBeenCalledTimes(2);
  });

  test('a refusal is reported as refused', async () => {
    mockParse.mockResolvedValue({
      status: 'completed',
      output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'I cannot help with that.' }] }],
      output_parsed: null,
    });

    const response = await POST(quizRequest({ topic: 'נושא לא ראוי' }));

    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ error: 'refused' });
    expect(mockParse).toHaveBeenCalledTimes(1);
  });

  test('a response with no parsed output is treated as malformed', async () => {
    mockParse.mockResolvedValue(parsedResponse(null));

    const response = await POST(quizRequest({ categoryId: 'film-and-tv' }));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: 'unavailable' });
    expect(mockParse).toHaveBeenCalledTimes(2);
  });

  test.each([
    ['duplicate answers', { ...generatedQuestions[0], answers: ['א', 'א', 'ג', 'ד'] }],
    ['an empty question', { ...generatedQuestions[0], question: '  ' }],
    ['an empty explanation', { ...generatedQuestions[0], explanation: '' }],
    ['a repeated question', generatedQuestions[1]],
  ])('a quiz with %s is treated as malformed', async (_case, firstQuestion) => {
    mockParse.mockResolvedValue(parsedResponse([firstQuestion, ...generatedQuestions.slice(1)]));

    const response = await POST(quizRequest({ categoryId: 'general-knowledge' }));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: 'unavailable' });
    // One retry, then give up.
    expect(mockParse).toHaveBeenCalledTimes(2);
  });

  test('a missing API key fails safely without calling OpenAI', async () => {
    delete process.env.OPENAI_API_KEY;

    const response = await POST(quizRequest({ categoryId: 'geography' }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'misconfigured' });
    expect(mockParse).not.toHaveBeenCalled();
  });
});
