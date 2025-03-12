import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function NotFoundScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Meetups after 1 second
    setTimeout(() => {
      router.replace('/(tabs)/meetups');
    }, 0);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>This screen doesn't exist. Redirecting...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
});
