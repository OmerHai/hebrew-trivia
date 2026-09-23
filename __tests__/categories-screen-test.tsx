import { fireEvent, render, screen } from '@testing-library/react-native';
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

  test('renders every category and the custom topic option as buttons, in order', async () => {
    await render(<CategoriesScreen />);

    const names = screen.getAllByRole('button').map((button) => button.props.accessibilityLabel);

    expect(names).toEqual(['ידע כללי', 'גאוגרפיה', 'קולנוע וטלוויזיה', 'טכנולוגיה', 'נושא משלי']);
  });

  test('the custom topic form is hidden until the option is chosen', async () => {
    await render(<CategoriesScreen />);

    expect(screen.queryByLabelText('הנושא שלך')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'נושא משלי' }));

    expect(screen.getByLabelText('הנושא שלך')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'צור משחק' })).toBeOnTheScreen();
  });

  test('uses light text on the dark color scheme', async () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');

    await render(<CategoriesScreen />);

    expect(screen.getByRole('header', { name: 'בחר נושא' })).toHaveStyle({ color: '#F2F5FA' });
  });
});
