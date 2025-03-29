import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import '@/authentication/aws-exports' //Change to whatever the path of the file is




export default function NotFoundScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Meetups after 1 second
    setTimeout(() => {
      router.replace('/login');
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BathLink</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8edf8", // Change to your app theme color
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
});
