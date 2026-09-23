import { render, screen } from '@testing-library/react-native';

import Index from '@/app/index';

describe('<Index />', () => {
  test('renders the placeholder home screen text', async () => {
    await render(<Index />);

    expect(screen.getByText('Edit src/app/index.tsx to edit this screen.')).toBeOnTheScreen();
  });
});
