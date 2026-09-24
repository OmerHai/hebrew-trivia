import AsyncStorage from '@react-native-async-storage/async-storage';

// The library's in-memory mock; each test starts with an empty device storage.
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Reanimated and Worklets need their native runtime; use their official test mocks.
jest.mock('react-native-worklets', () => jest.requireActual('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => jest.requireActual('react-native-reanimated/mock'));
// Screens rendered on their own have no SafeAreaProvider; the library's mock supplies zero insets.
jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);

beforeEach(() => AsyncStorage.clear());
