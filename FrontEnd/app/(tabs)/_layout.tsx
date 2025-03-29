import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colours from '../colours'
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const theme = useColorScheme();
  
  return (
    <Tabs initialRouteName="meetups"    
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: theme === 'dark' ? colours.dark.surface : colours.light.surface, // Tab bar background color
      },
      tabBarActiveTintColor: theme === 'dark' ? colours.dark.primary : colours.light.primary, 
      tabBarInactiveTintColor: theme === 'dark' ? colours.dark.deselected : colours.dark.deselected, 
    }}>
      <Tabs.Screen
        name="meetups"
        options={{ title: "Meetups", tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="matches"
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
