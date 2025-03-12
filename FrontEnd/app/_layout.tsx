import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack initialRouteName="(tabs)">
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: 'Edit Profile', headerBackTitle: "", headerBackTitleVisible: false}} />

    </Stack>
  );
}
