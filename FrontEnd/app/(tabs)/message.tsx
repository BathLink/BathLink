import { Image, View, StyleSheet, Platform } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  let primary_color = "black"
  let background_color = "white"
  let transparent_color = "rgba(0, 0, 0, 0)"

  if (colorScheme === 'dark') {
    primary_color = "white"
    background_color = "rgba(0, 0, 0, 0)"
  } else {
    primary_color = "black"
    background_color = "rgba(0, 0, 0, 0)"
  }

  const testBtn = () => {
    console.log('Button pressed');
  };

  return (
    // Top Bar
    <View>
      <View style={styles.titleContainer}>
        <MaterialIcons.Button name="person" size={28} color={primary_color} backgroundColor={transparent_color} onPress={testBtn}/>
        <ThemedText type="title" >BathLink</ThemedText>
        <MaterialIcons.Button name="notifications" size={28} color={primary_color} backgroundColor={transparent_color} onPress={testBtn}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Top Bar Style Part
  titleContainer: {
    flexDirection: 'row',
    flexGrow: 2,
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  }
});
