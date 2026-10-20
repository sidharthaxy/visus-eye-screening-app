import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { Colors, Radius, Sizes, Type } from '@/constants/theme';

const TABS: Record<string, { label: string; icon: IconName }> = {
  home: { label: 'Home', icon: 'home' },
  tests: { label: 'Tests', icon: 'eye' },
  results: { label: 'Results', icon: 'results' },
  profile: { label: 'Profile', icon: 'profile' },
};

/** Floating pill tab bar from the design. Used as the `tabBar` of (tabs). */
export function BottomTabBar({ state, navigation, insets }: BottomTabBarProps) {
  return (
    <View style={[styles.bar, { bottom: Math.max(insets.bottom, 10) + 16 }]}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = state.index === index;
        const color = focused ? Colors.white : Colors.tabInactive;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            onPress={onPress}
            style={({ pressed }) => [styles.tab, focused && styles.active, !focused && pressed && styles.pressed]}>
            <Icon name={tab.icon} size={22} color={color} />
            <Text style={[Type.tab, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: Sizes.tabBar,
    padding: 6,
    gap: 4,
    flexDirection: 'row',
    borderRadius: Radius.hero,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    boxShadow: '0 10px 30px rgba(17,17,17,0.08)',
  },
  tab: {
    flex: 1,
    borderRadius: Radius.tile,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  active: { backgroundColor: Colors.ink },
  pressed: { backgroundColor: Colors.pressed },
});
