import { Tabs } from 'expo-router/js-tabs';

import { BottomTabBar } from '@/components/BottomTabBar';
import { Colors } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: Colors.bg } }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="tests" />
      <Tabs.Screen name="results" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
