import { type AndroidSymbol, type SFSymbol, SymbolView } from 'expo-symbols';
import type { ColorValue } from 'react-native';

export type IconName = { ios: SFSymbol; android: AndroidSymbol };

type Props = {
  name: IconName;
  size: number;
  color: ColorValue;
};

/** An SF Symbol on iOS, the matching Material Symbol on Android and web. Decorative. */
export function Icon({ name, size, color }: Props) {
  return (
    <SymbolView
      name={{ ios: name.ios, android: name.android, web: name.android }}
      size={size}
      tintColor={color}
      weight="semibold"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
