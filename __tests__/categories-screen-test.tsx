import { render, screen } from '@testing-library/react-native';
import * as ReactNative from 'react-native';

import CategoriesScreen from '@/app/categories';

describe('<CategoriesScreen />', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders the Hebrew title', async () => {
    await render(<CategoriesScreen />);

    expect(screen.getByRole('header', { name: 'בחר נושא' })).toBeOnTheScreen();
  });

  test('renders every category as a button, in order', async () => {
    await render(<CategoriesScreen />);

    const names = screen.getAllByRole('button').map((button) => button.props.accessibilityLabel);

    expect(names).toEqual(['ידע כללי', 'גאוגרפיה', 'קולנוע וטלוויזיה', 'טכנולוגיה']);
  });

  test('uses light text on the dark color scheme', async () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');

    await render(<CategoriesScreen />);

    expect(screen.getByRole('header', { name: 'בחר נושא' })).toHaveStyle({ color: '#F2F5FA' });
  });
});
