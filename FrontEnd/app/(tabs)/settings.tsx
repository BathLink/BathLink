import { View, StyleSheet, Switch, TouchableOpacity, Text, ScrollView, Alert, Appearance } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from "expo-router";
import {signOut, updatePassword, getCurrentUser} from 'aws-amplify/auth';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false); // Dark mode state
  const [highContrast, setHighContrast] = useState(false); // High contrast state
  const [fontSize, setFontSize] = useState(18); // Default to small font size
  const [headerSize, setHeaderSize] = useState(22);

  // Detect the initial theme based on system setting
  useEffect(() => {
    const colorScheme = Appearance.getColorScheme(); // Get the system's current color scheme
    setIsDarkMode(colorScheme === 'dark'); // Set the initial state based on system preference
  }, []);

  // Listen for theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDarkMode(colorScheme === 'dark'); // Update dark mode when system theme changes
    });

    return () => {
      subscription.remove(); // Cleanup listener on unmount
    };
  }, []);

  const fontSizeOptions = {
    small: 18,
    medium: 22,
    large: 26,
  };

  const headerSizeOptions = {
    small: 22,
    medium: 26,
    large: 30,
  };

  const handleFontSizeChange = (size) => {
    setFontSize(fontSizeOptions[size]);
    setHeaderSize(headerSizeOptions[size]);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev); // Toggle dark mode
  };

  // Dynamically set primary color and background color based on dark mode
  const primary_color = highContrast ? 'yellow' : isDarkMode ? "white" : "black";
  const background_color = highContrast ? 'black' : isDarkMode ? "rgba(20,20,20,20)" : "rgba(240, 240, 240, 240)"; // Add this dynamic update

  const handleLogout = async () => {
    await signOut();
    
    Alert.alert(
            "You have logged out successfully.",
            '',
            [
              {
                text: 'OK',
                onPress: () => {},
              },
            ],
            { cancelable: false }
          );
    router.replace("/login");
  };

  const [isEnabled, setIsEnabled] = useState(false);
  const [isEnabled1, setIsEnabled1] = useState(false);
  const [isEnabled2, setIsEnabled2] = useState(false);
  const [isEnabled3, setIsEnabled3] = useState(false);

  const toggleSwitch2 = (value) => { setIsEnabled2(value); };
  const toggleSwitch3 = (value) => { setIsEnabled3(value); };
  const toggleSwitch4 = (value) => { setHighContrast(value); };

  const toggleSwitch = (value) => {
    setIsEnabled(value);

    if (value) {
      Alert.alert(
        'Push Notifications \n',
        'You have enabled Push Notifications.',
        [
          {
            text: 'OK',
            onPress: () => {},
          },
        ],
        { cancelable: false }
      );
    } else {
      Alert.alert(
        'Push Notifications \n',
        'You have disabled Push Notifications.',
        [
          {
            text: 'OK',
            onPress: () => {},
          },
        ],
        { cancelable: false }
      );
    }
  };

  const toggleSwitch1 = (value) => {
    setIsEnabled1(value);

    if (value) {
      Alert.alert(
        'Email Notifications \n',
        'You have enabled Notify Me via Email.',
        [
          {
            text: 'OK',
            onPress: () => {},
          },
        ],
        { cancelable: false }
      );
    } else {
      Alert.alert(
        'Email Notifications \n',
        'You have disabled Notify Me via Email.',
        [
          {
            text: 'OK',
            onPress: () => {},
          },
        ],
        { cancelable: false }
      );
    }
  };

  /** PASSWORD CHANGE FUNCTION */
const handleChangePassword = async () => {
    try {
        const {username, userId, signInDetails} = await getCurrentUser();
    await updatePassword({oldPassword : currentPassword, newPassword : newPassword})
        Alert.alert("Success", "Password changed successfully!");
        setModalVisible(false);
    }
    catch(e){
        console.log(e)
        }
  }

  const profileBtn = async () => {
      await AsyncStorage.setItem("page", "/settings");
      router.replace('/profile')
  };

  return (
    <View style={[styles.container, { backgroundColor: background_color }]}>
      {/* Top Header Bar */}
      <View style={styles.titleContainer}>
        <MaterialIcons.Button
          name="person" size={28} color={primary_color} backgroundColor="transparent"
          onPress={profileBtn}
        />
          <ThemedText type="title" >BathLink</ThemedText>
        <MaterialIcons.Button
          name="notifications" size={28} color="transparent" backgroundColor="transparent"
        />
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={{ paddingBottom: 82 }}>

        {/* Appearance Settings */}
      <Text style={[styles.emptySpace, { color: primary_color }]}></Text>
      <View style={styles.settingHeader}>
        <Text style={[styles.categoryHeader, { color: primary_color, fontSize: headerSize }]}>Appearance</Text>
      </View>
        <View style={styles.settingOption}>
          <View style={styles.settingText}>
            <MaterialIcons name="brightness-4" size={28} color={'gray'} style={styles.icon} />
            <Text style={[styles.optionText, { color: primary_color, fontSize: fontSize }]}>     Toggle Dark Mode</Text>
          </View>
            <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
        </View>
        <View style={styles.settingOption}>
          <View style={styles.settingText}>
            <MaterialIcons name="format-size" size={28} color={'gray'} style={styles.icon} />
            <Text style={[styles.optionText, { color: primary_color, fontSize: fontSize }]}>     Font Size</Text>
          </View>
          {/* Font size switch with options */}
          <View style={styles.fontSizeOptions}>
            <TouchableOpacity onPress={() => handleFontSizeChange('small')}>
              <Text style={[styles.optionText, {
                  color: primary_color,
                  fontWeight: 'bold',
                  fontSize: 18,
                  lineHeight: 30,
                   }]}>A</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleFontSizeChange('medium')}>
              <Text style={[styles.optionText, {
                  color: primary_color,
                  fontWeight: 'bold',
                  fontSize: 24,
                  lineHeight: 30,
                   }]}>A</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleFontSizeChange('large')}>
              <Text style={[styles.optionText, {
                  color: primary_color,
                  fontWeight: 'bold',
                  fontSize: 30,
                  lineHeight: 32,
                  }]}>A</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications Settings */}
        <Text style={[styles.emptySpace, { color: primary_color }]}></Text>
        <View style={styles.settingHeader}>
            <Text style={[styles.categoryHeader, { color: primary_color, fontSize: headerSize }]}>Notifications</Text>
        </View>
        <View style={styles.settingOption}>
          <View style={styles.settingText}>
            <MaterialIcons name="notifications" size={28} color={'gray'} style={styles.icon} />
            <Text style={[styles.optionText, { color: primary_color, fontSize: fontSize }]}>     Push Notifications</Text>
          </View>
          <Switch value={isEnabled} onValueChange={toggleSwitch} />
        </View>
        <View style={styles.settingOption}>
          <View style={styles.settingText}>
            <MaterialIcons name="mail-outline" size={27} color={'gray'} style={styles.icon} />
            <Text style={[styles.optionText, { color: primary_color, fontSize: fontSize }]}>     Notify Me via Email</Text>
          </View>
          <Switch value={isEnabled1} onValueChange={toggleSwitch1} />
        </View>

        {/* Accessibility Settings */}
        <Text style={[styles.emptySpace, { color: primary_color }]}></Text>
        <View style={styles.settingHeader}>
            <Text style={[styles.categoryHeader, { color: primary_color, fontSize: headerSize }]}>Accessibility</Text>
        </View>
        <View style={styles.settingOption}>
          <View style={styles.settingText}>
            <MaterialIcons name="search" size={27} color={'gray'} style={styles.icon} />
            <Text style={[styles.optionText, { color: primary_color, fontSize: fontSize }]}>     Magnifier</Text>
          </View>
          <Switch value={isEnabled2} onValueChange={toggleSwitch2} />
        </View>
        <View style={styles.settingOption}>
          <View style={styles.settingText}>
            <MaterialIcons name="campaign" size={27} color={'gray'} style={styles.icon} />
            <Text style={[styles.optionText, { color: primary_color, fontSize: fontSize }]}>     Read Aloud</Text>
          </View>
            <Switch value={isEnabled3} onValueChange={toggleSwitch3} />
        </View>
        <View style={styles.settingOption}>
          <View style={styles.settingText}>
              <MaterialIcons name="invert-colors" size={24} color={'gray'} />
              <Text style={[styles.optionText, { color: primary_color, fontSize: fontSize }]}>     High Contrast</Text>
          </View>
              <Switch value={highContrast} onValueChange={toggleSwitch4} />
        </View>
        {/* Account Settings */}
        <Text style={[styles.emptySpace, { color: primary_color }]}></Text>
        <View style={styles.settingHeader}>
            <Text style={[styles.categoryHeader, { color: primary_color, fontSize: headerSize }]}>Account</Text>
        </View>
        <TouchableOpacity style={styles.settingOption} onPress={() => alert("Your Password has been changed.")}>
          <Text style={[styles.optionText, { color: primary_color, fontSize: fontSize }]}>Change Password</Text>
          <MaterialIcons name="lock" size={24} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingOption} onPress={handleLogout}>
          <Text style={[styles.optionText, { color: "red", fontSize: fontSize }]}>Log Out</Text>
          <MaterialIcons name="logout" size={24} color="red" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    marginTop: 52,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  categoryHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  titleText: { fontSize: 28, fontWeight: 'bold' },
  subheader: { fontSize: 25, fontWeight: 'bold', marginVertical: 10, paddingHorizontal: 20 },
  settingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  settingText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  optionText: { fontSize: 18 },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'left',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
    emptySpace: {
      flexDirection: 'row',
      justifyContent: 'left',
      alignItems: 'center',
      paddingVertical: 3,
      paddingHorizontal: 20,
    },
    fontSizeOptions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '27%',
      marginVertical: 10,
      alignSelf: 'bottom',
      paddingHorizontal: 3,
    },
});

