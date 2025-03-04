import { View, StyleSheet, ScrollView } from 'react-native';
import { Divider } from 'react-native-paper'; 

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

  let items = [ 
    ['1', 'AAA'], 
    ['2', 'AAA'], 
    ['3', 'AAA'], 
    ['4', 'AAA'], 
    ['5', 'AAA'], 
    ['6', 'AAA'], 
    ['1', 'AAA'], 
    ['2', 'AAA'], 
    ['3', 'AAA'], 
    ['4', 'AAA'], 
    ['5', 'AAA'], 
    ['6', 'AAA'], 
    ['1', 'AAA'], 
    ['2', 'AAA'], 
    ['3', 'AAA'], 
    ['4', 'AAA'], 
    ['5', 'AAA'], 
    ['6', 'AAA'], 
  ]; 

  return (
    <View>
      {/* Top Menu App Bar */}
      <View style={styles.titleContainer}>
        <MaterialIcons.Button name="person" size={28} color={primary_color} backgroundColor={transparent_color} onPress={testBtn}/>
        <ThemedText type="title" >BathLink</ThemedText>
        <MaterialIcons name="notifications" size={28} color={transparent_color} backgroundColor={transparent_color}/>
      </View>

      <ThemedText style={styles.headLine}>
          {`Settings`}
      </ThemedText>

      <Divider bold={true}/>

      <ScrollView contentContainerStyle={{ alignItems: 'center' }} style={styles.listContainer}>
      {items.map((item) => { 
        return ( 
          <View style={styles.listitem}>
            <View style={styles.content}>
              <ThemedText style={styles.nameText}>
                {item[0]}
              </ThemedText>
              <ThemedText style={styles.supportingtext}>
                {item[1]}
              </ThemedText>
            </View>
            <Divider bold={true}/>
          </View>
          );
      })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Top Bar Style Part
  titleContainer: {
    flexDirection: 'row',
    flexGrow: 2,
    marginTop: 52,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  listContainer: {
    position: "relative",
    flexShrink: 0,
    height: 693,
    width: 412,
    paddingTop: 0,
    paddingBottom: 16,
    display: "flex",
    flexDirection: "column",
    rowGap: 0,
    paddingHorizontal: 0
  },
  listitem: {
    position: "relative",
    flexShrink: 0,
    height: 57,
    width: 412,
    display: "flex",
    flexDirection: "column",
    rowGap: 0
  },
  content: {
    position: "absolute",
    flexShrink: 0,
    top: 6,
    bottom: 7,
    left: 17,
    right: 17,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    rowGap: 0
  },
  headLine: {
    position: "relative",
    flexShrink: 0,
    textAlign: "left",
    marginLeft: 16,
    fontSize: 24,
    fontWeight: 600,
  }, 
  nameText: {
    position: "relative",
    flexShrink: 0,
    textAlign: "left",
    marginTop: 3,
    fontSize: 24,
    fontWeight: 600,
  }, 
  supportingtext: {
    position: "relative",
    alignSelf: "stretch",
    flexShrink: 0,
    textAlign: "left",
    fontSize: 14,
    fontWeight: 400,
  },
});
