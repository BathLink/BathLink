import { Image, View, StyleSheet, Platform } from 'react-native';
import { Divider } from 'react-native-paper'; 
import { Svg, Path } from 'react-native-svg';

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
    <View>
      {/* Top Menu App Bar */}
      <View style={styles.titleContainer}>
        <MaterialIcons.Button name="person" size={28} color={primary_color} backgroundColor={transparent_color} onPress={testBtn}/>
        <ThemedText type="title" >BathLink</ThemedText>
        <MaterialIcons.Button name="notifications" size={28} color={transparent_color} backgroundColor={transparent_color} onPress={testBtn}/>
      </View>

      <ThemedText style={styles.headLine}>
          {`Matches`}
      </ThemedText>

      <Divider bold={true}/>

      <View style={styles.headlineContainer}>
        <ThemedText style={styles.nameText}>
          {`Invitations`}
        </ThemedText>
        <ThemedText style={styles.nameText}>
          {`Preferences`}
        </ThemedText>
      </View>

      <View style={styles.stackedcardContainer}>
      {/* Visualwind:: can be replaced with <Iconbutton style={"filled"} state={"enabled"} /> */}
        <View style={styles.iconbutton}>
          <View style={styles.container}>
            <View style={styles.statelayer}>
            {/* Visualwind:: can be replaced with <Icon /> */}
              <View style={styles.icon}>
                <Svg style={styles.icon} width="18" height="13" viewBox="0 0 18 13" fill="none" >
                  <Path d="M6.54998 13L0.849976 7.30001L2.27498 5.87501L6.54998 10.15L15.725 0.975006L17.15 2.40001L6.54998 13Z" fill="white"/>
                </Svg>
              </View>
            </View>
          </View>
        </View>
          {/* Visualwind:: can be replaced with <_iconbutton style={"tonal"} state={"enabled"} /> */}
        <View style={styles.iconbutton}>
          <View style={styles.container}>
            <View style={styles.statelayer}>
              {/* Visualwind:: can be replaced with <__icon /> */}
              <View style={styles.icon}>
                <Svg style={styles.icon} width="14" height="14" viewBox="0 0 14 14" fill="none" >
                  <Path d="M1.4 14L0 12.6L5.6 7L0 1.4L1.4 0L7 5.6L12.6 0L14 1.4L8.4 7L14 12.6L12.6 14L7 8.4L1.4 14Z" fill="#4A4459"/>
                </Svg>
              </View>
            </View>
          </View>
        </View>
        <ThemedText style={styles.header}>
          {`Indoor Tennis `}
        </ThemedText>
        <ThemedText style={styles.withNathanielJohnJamesSaturday12thFeb202508001000SportsTrainingVillageBathBA27JX}>
          {`With Nathaniel, John, James\nSaturday 12th Feb 2025 08:00 - 10:00\nSports Training Village, Bath, BA2 7JX`}
        </ThemedText>
          {/* Visualwind:: can be replaced with <Background state={"enabled"} /> */}
        <View style={styles.background}>
          <View style={styles.statelayer}/>
        </View>
          {/* Visualwind:: can be replaced with <_background state={"enabled"} /> */}
        <View style={styles.background}>
          <View style={styles.statelayer}/>
        </View>
          {/* Visualwind:: can be replaced with <__background state={"enabled"} /> */}
        <View style={styles.background}>
          <View style={styles.statelayer}/>
        </View>
      </View>


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
  headLine: {
    position: "relative",
    flexShrink: 0,
    textAlign: "left",
    marginLeft: 16,
    fontSize: 24,
    fontWeight: 600,
  }, 
  nameText: {
    flexShrink: 0,
    textAlign: "left",
    marginTop: 8,
    fontSize: 24,
    fontWeight: 600,
  }, 
  headlineContainer: {
    position: "relative",
    flexDirection: "row",
    justifyContent: 'space-between',
    display: "flex",
    alignItems: "center",
    columnGap: 0,
    paddingHorizontal: 16,
  },

  stackedcardContainer: {
    position: "relative",
    flexShrink: 0,
    height: 96,
    width: 393,
    display: "flex",
    alignItems: "flex-start",
    columnGap: 0,
    borderRadius: 12
  },
  iconbutton: {
    position: "absolute",
    flexShrink: 0,
    top: 24,
    height: 48,
    left: 262,
    width: 48,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    rowGap: 10,
    padding: 4
  },
  container: {
    position: "relative",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 10,
    borderRadius: 100
  },
  icon: {
    position: "relative",
    flexShrink: 0,
    height: 24,
    width: 24,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    rowGap: 0
  },
  statelayer: {
    position: "relative",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 10,
    padding: 8
  },
  header: {
    position: "absolute",
    flexShrink: 0,
    top: 11,
    left: 12,
    width: 101,
    height: 24,
    textAlign: "left",
    fontSize: 16,
    fontWeight: 700,
  },
  withNathanielJohnJamesSaturday12thFeb202508001000SportsTrainingVillageBathBA27JX: {
    position: "absolute",
    flexShrink: 0,
    top: 34,
    left: 12,
    width: 321,
    height: 45,
    textAlign: "left",
    fontFamily: "Roboto",
    fontSize: 12,
    fontWeight: 500,
  },
  background: {
    position: "absolute",
    flexShrink: 0,
    height: 92,
    width: 393,
    borderStyle: "solid",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    rowGap: 0,
    borderWidth: 1,
    borderColor: "rgba(202, 196, 208, 1)",
    borderRadius: 12
  },
    
});
