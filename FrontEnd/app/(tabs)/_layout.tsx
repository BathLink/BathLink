import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colours from '../colours';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const theme = useColorScheme();
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0); // 0: profile, 1: matches, 2: preferences, 3: settings, 4: meetups, 5: thank you
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const seenTour = await AsyncStorage.getItem('seenGuidedTour');
      if (!seenTour) setShowTour(true);
    })();
  }, []);

  const handleNextTour = async () => {
    if (tourStep === 0) {
      setTourStep(1);
      router.push('/matches');
    } else if (tourStep === 1) {
      setTourStep(2);
      // Stay on matches page for preferences pointer
    } else if (tourStep === 2) {
      setTourStep(3);
      router.push('/settings');
    } else if (tourStep === 3) {
      setTourStep(4);
      router.push('/meetups');
    } else if (tourStep === 4) {
      setTourStep(5);
      // Show thank you modal
    } else {
      await AsyncStorage.setItem('seenGuidedTour', 'true');
      setShowTour(false);
      setTourStep(0);
    }
  };

  return (
    <>
      <Tabs initialRouteName="meetups"    
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme === 'dark' ? colours.dark.surface : colours.light.surface,
          },
          tabBarActiveTintColor: theme === 'dark' ? colours.dark.primary : colours.light.primary, 
          tabBarInactiveTintColor: theme === 'dark' ? colours.dark.deselected : colours.dark.deselected, 
        }}>
        <Tabs.Screen
          name="meetups"
          options={{ title: "Meetups", tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} /> }}
        />
        <Tabs.Screen
          name="matches"
          options={{ title: "Matches", tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} /> }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />,
          }}
        />
      </Tabs>
      {/* Profile step modal */}
      <Modal visible={showTour && tourStep === 0} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.pointerContainer}>
            <View style={styles.arrowUp} />
            <View style={styles.speechBubble}>
              <Text style={styles.pointerText}>
                Click here to change your profile
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.fullscreenTouchable} onPress={handleNextTour} />
        </View>
      </Modal>
      {/* Matches step modal */}
      <Modal visible={showTour && tourStep === 1} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.matchesPointerContainer}>
            <View style={styles.speechBubble}>
              <Text style={styles.pointerText}>
                This is where you find your matches!
              </Text>
            </View>
            <View style={styles.arrowDown} />
          </View>
          <TouchableOpacity style={styles.fullscreenTouchable} onPress={handleNextTour} />
        </View>
      </Modal>
      {/* Preferences step modal */}
      <Modal visible={showTour && tourStep === 2} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.preferencesPointerContainerOnMatches}>
            <View style={styles.arrowUp} />
            <View style={styles.speechBubble}>
              <Text style={styles.pointerText}>
                This is how you update which matches you would like to receive!
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.fullscreenTouchable} onPress={handleNextTour} />
        </View>
      </Modal>
      {/* Settings step modal */}
      <Modal visible={showTour && tourStep === 3} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.settingsPointerContainerNav}>
            <View style={styles.speechBubble}>
              <Text style={styles.pointerText}>
                Here you can update your app settings!
              </Text>
            </View>
            <View style={styles.arrowDown} />
          </View>
          <TouchableOpacity style={styles.fullscreenTouchable} onPress={handleNextTour} />
        </View>
      </Modal>
      {/* Meetups step modal */}
      <Modal visible={showTour && tourStep === 4} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.meetupsPointerContainerNav}>
            <View style={styles.speechBubble}>
              <Text style={styles.pointerText}>
                Here's how to get back to showing your current scheduled meetups!
              </Text>
            </View>
            <View style={styles.arrowDown} />
          </View>
          <TouchableOpacity style={styles.fullscreenTouchable} onPress={handleNextTour} />
        </View>
      </Modal>
      {/* Thank you step modal */}
      <Modal visible={showTour && tourStep === 5} transparent animationType="fade">
        <View style={styles.thankYouOverlay}>
          <View style={styles.thankYouBox}>
            <Text style={styles.thankYouTitle}>Now its over to you!</Text>
            <TouchableOpacity style={styles.thankYouButton} onPress={handleNextTour}>
              <Text style={styles.thankYouButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  tourBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    maxWidth: 320,
    alignItems: 'center',
    elevation: 5,
  },
  tourTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tourText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'left',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pointerContainer: {
    position: 'absolute',
    top: 115, // Adjust as needed to be just below the profile icon
    left: 20, // Keep on the left side
    alignItems: 'flex-start',
    zIndex: 10,
  },
  matchesPointerContainer: {
    position: 'absolute',
    // These values should be tuned to match the matches tab icon in the middle
    bottom: 100, // Just above the tab bar
    left: '50%',
    marginLeft: -90, // Half of speechBubble width to center
    alignItems: 'center',
    zIndex: 10,
  },
  preferencesPointerContainer: {
    // (no longer used, keep for reference)
  },
  preferencesPointerContainerOnMatches: {
    position: 'absolute',
    top: 180, // Near the top of the matches page, adjust as needed
    right: 30, // Position to the right, next to invitations button; adjust as needed
    alignItems: 'center',
    zIndex: 10,
  },
  settingsPointerContainer: {
    // (no longer used)
  },
  settingsPointerContainerNav: {
    position: 'absolute',
    bottom: 40, // At the bottom for nav bar
    left: '50%', // Adjust to align with the settings tab icon in the navigation bar
    alignItems: 'flex-end',
    zIndex: 10,
    marginBottom: 60, // Just above the tab bar, adjust as needed
  },
  meetupsPointerContainerNav: {
    position: 'absolute',
    bottom: 40, // At the bottom for nav bar
    left: 25, // Adjust to align with the meetups tab icon in the navigation bar (left side)
    alignItems: 'flex-start',
    zIndex: 10,
    marginBottom: 60, // Just above the tab bar, adjust as needed
  },
  arrowDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    marginTop: 4,
    marginRight: 30,
    marginLeft: 30
  },
  arrowUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
    marginBottom: 4,
    marginLeft: 10,
  },
  speechBubble: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    maxWidth: 180,
    elevation: 4,
    marginBottom: 4,
  },
  pointerText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  fullscreenTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  thankYouOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thankYouBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 32,
    maxWidth: 320,
    alignItems: 'center',
    elevation: 8,
  },
  thankYouTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  thankYouText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  thankYouButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  thankYouButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
