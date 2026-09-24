import { render, screen } from '@testing-library/react-native';
import * as ReactNative from 'react-native';

import CategoriesScreen from '@/app/categories';
import { categories } from '@/data/categories';
import { categoryTints, palette } from '@/theme';

describe('<CategoriesScreen />', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders all 16 predefined categories as buttons, in order', async () => {
    await render(<CategoriesScreen />);

    const names = screen.getAllByRole('button').map((button) => button.props.accessibilityLabel);

    expect(names).toHaveLength(16);
    expect(names).toEqual(categories.map((category) => category.name));
  });

  test('lays the categories out as a two-column grid', async () => {
    await render(<CategoriesScreen />);

    const rows = new Set(screen.getAllByRole('button').map((button) => button.parent));
    expect(rows.size).toBe(8);
    for (const row of rows) expect(row?.children).toHaveLength(2);
  });

  test('each category shows its Hebrew name on its own soft color, without emoji', async () => {
    await render(<CategoriesScreen />);

    for (const category of categories) {
      const tile = screen.getByRole('button', { name: category.name });
      expect(tile).toHaveTextContent(category.name);
      expect(tile).toHaveStyle({ backgroundColor: categoryTints.light[category.tint].background });
      expect(tile).not.toHaveTextContent(/\p{Extended_Pictographic}/u);
    }
  });

  test('the custom topic option is no longer offered', async () => {
    await render(<CategoriesScreen />);

    expect(screen.queryByRole('button', { name: 'נושא משלי' })).not.toBeOnTheScreen();
    expect(screen.queryByText('נושא משלי')).not.toBeOnTheScreen();
    expect(screen.queryByLabelText('הנושא שלך')).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'צור משחק' })).not.toBeOnTheScreen();
  });

  test('uses the dark palette and dark tints in dark mode', async () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');

    await render(<CategoriesScreen />);

    const [first] = categories;
    expect(screen.getByRole('button', { name: first.name })).toHaveStyle({
      backgroundColor: categoryTints.dark[first.tint].background,
    });
    expect(screen.getByText(first.name)).toHaveStyle({ color: palette.dark.text });
  });
});
