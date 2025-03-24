import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';


export default function TabLayout() {
  return (
    <Tabs initialRouteName="meetups" screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="meetups"
        options={{ title: "Meetups", tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="index"
        options={{ title: "Matches", tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
