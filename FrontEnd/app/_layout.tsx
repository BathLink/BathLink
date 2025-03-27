import { Stack } from 'expo-router';
import 'react-native-reanimated';

export default function RootLayout() {
<<<<<<< HEAD
=======
  const router = useRouter();

>>>>>>> main

  return (
    <Stack initialRouteName="(tabs)">
      <Stack.Screen name="(tabs)" options={{ headerShown: false}} />
      <Stack.Screen name="profile" options = {{title: "", headerShown: false}}  />
      <Stack.Screen name="login" options={{ title: "" , headerShown: false}}/>
      <Stack.Screen name="register" options={{ title: "", headerShown: false }}/>
      <Stack.Screen name="confirmEmail" options={{ title: "", headerShown: false }}/>
      <Stack.Screen name="+not-found" options={{ title: "", headerShown: false}}/>
    </Stack>
  );
}
