import { View, Text, Button, StyleSheet, Platform, ScrollView, TouchableHighlight, TouchableOpacity } from 'react-native';
import {useState} from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Divider } from 'react-native-paper';
import { Svg, Path } from 'react-native-svg';

import { ThemedText } from '@/components/ThemedText';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/useColorScheme';







export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [selectedTab, setSelectedTab] = useState('Matches');

  // Track which button is selected for each match
  const [buttonStates, setButtonStates] = useState(
    Array(5).fill({ checkSelected: false, cancelSelected: false })
  );

  const testBtn = () => {
    console.log('Button pressed');
  };

  const router = useRouter();
  const primary_color = colorScheme === 'dark' ? 'white' : 'black';
  const background_color = colorScheme === 'dark' ? 'rgba(0, 0, 0, 0)' : 'rgba(0, 0, 0, 0)';

  const matches = [
    ["Indoor Tennis", ["Nathaniel", "John",], "Saturday 12th Feb 2025", "08:00 - 10:00", "Sports Training Village, Bath, BA2 7JX"],
    ["Indoor Tennis", ["Nathaniel", "John", "James"], "Saturday 12th Feb 2025", "08:00 - 10:00", "Sports Training Village, Bath, BA2 7JX"],
    ["Outdoor Tennis", ["Nathaniel", "John", "James", "Jim"], "Saturday 12th Feb 2025", "08:00 - 10:00", "Sports Training Village, Bath, BA2 7JX"],
    ["Indoor Tennis", ["John", "James"], "Saturday 12th Feb 2025", "08:00 - 10:00", "Sports Training Village, Bath, BA2 7JX"],
    ["Indoor Tennis", ["Nathaniel", "John", "James"], "Saturday 12th Feb 2025", "08:00 - 10:00", "Sports Training Village, Bath, BA2 7JX"],
  ];

  const toggleButton = (index, type) => {
    setMatches(prevMatches => {
      const updatedMatches = [...prevMatches];
      const [match] = updatedMatches.splice(index, 1); // remove match

      if (type === 'check') {
        //alert("Confirmed", `You confirmed: ${match[0]} with ${match[1].join(', ')}`);
      } else {
        //alert("Cancelled", `You cancelled: ${match[0]} with ${match[1].join(', ')}`);
      }

      return updatedMatches;
    });
  };

  const profileBtn = async () => {
      await AsyncStorage.setItem("page", "/matches");
      router.replace('/profile')
  };

  return (
    <View style={{ flex: 1, backgroundColor }}>
      {/* Top Menu App Bar */}
      <View style={styles.titleContainer}>
        <MaterialIcons.Button name="person" size={28} color={primary_color} backgroundColor="transparent" onPress={profileBtn} />
        <ThemedText type="title">BathLink</ThemedText>
        <MaterialIcons.Button name="notifications" size={28} color={"transparent"} backgroundColor="transparent" onPress={() => {testBtn}} />
      </View>



      {/* Tabs */}
      <View style={[styles.tabContainer, { borderBottomColor: isDark ? '#555' : '#ccc' }]}>
        {['Matches', 'Invitations', 'Preferences'].map(tab => (
          <TouchableOpacity key={tab} onPress={() => setSelectedTab(tab)}>
            <Text style={[
              styles.tabText,
              { color: isDark ? '#aaa' : '#777' },
              selectedTab === tab && {
                color: primaryColor,
                fontWeight: 'bold',
                borderBottomWidth: 2,
                borderBottomColor: primaryColor,
                paddingBottom: 4
              }
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Matches List */}
      <ScrollView style={styles.matchList}>
        {matches.map((match, index) => (
          <View key={index} style={[styles.matchCard, { backgroundColor: cardBackground }]}>
            <Text style={[styles.matchTitle, { color: textColor }]}>{match[0]}</Text>
            <Text style={[styles.matchDetail, { color: textColor }]}>With {match[1].join(', ')}</Text>
            <Text style={[styles.matchDetail, { color: textColor }]}>{match[2]} {match[3]}</Text>
            <Text style={[styles.matchDetail, { color: textColor }]}>{match[4]}</Text>
            <View style={styles.buttonRow}>
              <TouchableHighlight
                underlayColor="#346beb"
                style={styles.iconContainer}
                onPress={() => toggleButton(index, 'check')}
              >
                <MaterialIcons name="check-circle" size={30} color="#5e4bb7" />
              </TouchableHighlight>

              <TouchableHighlight
                underlayColor="#9c0b0b"
                style={styles.iconContainer}
                onPress={() => toggleButton(index, 'cancel')}
              >
                <MaterialIcons name="cancel" size={30} color="#b79dcf" />
              </TouchableHighlight>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    marginTop: 52,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  tabText: {
    fontSize: 16,
  },
  matchList: {
    paddingHorizontal: 16,
  },
  matchCard: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  matchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  matchDetail: {
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 16,
  },
  iconContainer: {
    borderRadius: 20,
    padding: 4,
  },
  iconSelectedCheck: {
    backgroundColor: '#5e4bb7',
  },
  iconSelectedCancel: {
    backgroundColor: '#b79dcf',
  },
});

