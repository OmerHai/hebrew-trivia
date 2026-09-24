import { render, screen } from '@testing-library/react-native';
import * as ReactNative from 'react-native';

import CategoriesScreen from '@/app/categories';
import { categories } from '@/data/categories';

describe('<CategoriesScreen />', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders the Hebrew title', async () => {
    await render(<CategoriesScreen />);

    expect(screen.getByRole('header', { name: 'בחר נושא' })).toBeOnTheScreen();
  });

  test('renders all 16 predefined categories as buttons, in order', async () => {
    await render(<CategoriesScreen />);

    const names = screen.getAllByRole('button').map((button) => button.props.accessibilityLabel);

    expect(names).toHaveLength(16);
    expect(names).toEqual(categories.map((category) => category.name));
  });

  test('each category shows its emoji next to its Hebrew name', async () => {
    await render(<CategoriesScreen />);

    for (const category of categories) {
      expect(screen.getByText(category.emoji)).toBeOnTheScreen();
      expect(screen.getByText(category.name)).toBeOnTheScreen();
    }
  });

  test('the custom topic option is no longer offered', async () => {
    await render(<CategoriesScreen />);

    expect(screen.queryByRole('button', { name: 'נושא משלי' })).not.toBeOnTheScreen();
    expect(screen.queryByText('נושא משלי')).not.toBeOnTheScreen();
    expect(screen.queryByLabelText('הנושא שלך')).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'צור משחק' })).not.toBeOnTheScreen();
  });

  test('uses light text on the dark color scheme', async () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');

    await render(<CategoriesScreen />);

    expect(screen.getByRole('header', { name: 'בחר נושא' })).toHaveStyle({ color: '#F2F5FA' });
  });
});
