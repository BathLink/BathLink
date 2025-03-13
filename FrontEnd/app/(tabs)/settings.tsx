import { View, StyleSheet, Switch, TouchableOpacity, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useState } from 'react';
import { ThemedText } from '@/components/ThemedText';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();

  // Independent switch states
  const [switch1, setSwitch1] = useState(false);
  const [switch2, setSwitch2] = useState(false);
  const [switch3, setSwitch3] = useState(false);
  const [switch4, setSwitch4] = useState(false);
  const [switch5, setSwitch5] = useState(false);
  const [switch6, setSwitch6] = useState(false);

  let primary_color = colorScheme === 'dark' ? "white" : "black";
  let background_color = "rgba(0, 0, 0, 0)";

  const handleLogout = () => {
    console.log("Logging out...");
    alert("Logged out successfully!");
  };

  return (
    <View style={[styles.container, { backgroundColor: background_color }]}>
      {/* Top Bar (App Bar) */}
      <View style={styles.titleContainer}>
        <MaterialIcons.Button
          name="person"
          size={28}
          color={primary_color}
          backgroundColor="transparent"
          onPress={() => console.log('Profile pressed')}
        />
        <ThemedText type="title">BathLink</ThemedText>
        <MaterialIcons.Button
          name="notifications"
          size={28}
          color={primary_color}
          backgroundColor="transparent"
          onPress={() => console.log('Notifications pressed')}
        />
      </View>

      {/* Subheader: Settings */}
      <Text style={[styles.subheader, { color: primary_color }]}>Settings</Text>

      {/* Settings Options with Independent Switches */}
      <View style={styles.settingOption}>
        <Text style={[styles.optionText, { color: primary_color }]}>Setting 1</Text>
        <Switch value={switch1} onValueChange={setSwitch1} />
      </View>
      <View style={styles.settingOption}>
        <Text style={[styles.optionText, { color: primary_color }]}>Setting 2</Text>
        <Switch value={switch2} onValueChange={setSwitch2} />
      </View>
      <View style={styles.settingOption}>
        <Text style={[styles.optionText, { color: primary_color }]}>Setting 3</Text>
        <Switch value={switch3} onValueChange={setSwitch3} />
      </View>
      <View style={styles.settingOption}>
        <Text style={[styles.optionText, { color: primary_color }]}>Setting 4</Text>
        <Switch value={switch4} onValueChange={setSwitch4} />
      </View>
      <View style={styles.settingOption}>
        <Text style={[styles.optionText, { color: primary_color }]}>Setting 5</Text>
        <Switch value={switch5} onValueChange={setSwitch5} />
      </View>
      <View style={styles.settingOption}>
        <Text style={[styles.optionText, { color: primary_color }]}>Setting 6</Text>
        <Switch value={switch6} onValueChange={setSwitch6} />
      </View>

      <TouchableOpacity style={styles.settingOption} onPress={() => alert("Change Password")}>
        <Text style={[styles.optionText, { color: primary_color }]}>Change Password</Text>
        <MaterialIcons name="lock" size={24} color="gray" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingOption} onPress={handleLogout}>
        <Text style={[styles.optionText, { color: "red" }]}>Log Out</Text>
        <MaterialIcons name="logout" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    flexGrow: 2,
    marginTop: 52,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  subheader: {
    fontSize: 25,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  settingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingHorizontal: 20,
  },
  optionText: {
    fontSize: 18,
  },
});
