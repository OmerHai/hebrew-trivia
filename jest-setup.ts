import AsyncStorage from '@react-native-async-storage/async-storage';

// The library's in-memory mock; each test starts with an empty device storage.
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

beforeEach(() => AsyncStorage.clear());
