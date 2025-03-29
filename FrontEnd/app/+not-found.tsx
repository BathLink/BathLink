import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import '@/authentication/aws-exports' //Change to whatever the path of the file is
import colours from './colours';
import { useColorScheme } from '@/hooks/useColorScheme';


export default function NotFoundScreen() {
  const router = useRouter();
  const theme = useColorScheme();

  useEffect(() => {
    // Redirect to Meetups after 1 second
    setTimeout(() => {
      router.replace('/login');
    }, 2000);
  }, []);

  return (
    <View 
    style={[styles.container, {backgroundColor: colours[theme].background}] }
    >
      <Text 
      style={[styles.title, {color: colours[theme].text}]}
      >
        BathLink
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
});
