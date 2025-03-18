import { View, Text, Button, StyleSheet, Platform, ScrollView, TouchableHighlight, TouchableOpacity } from 'react-native';
import {useState} from 'react';
import { useRouter } from 'expo-router';
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
    ["Outdoor Tennis", ["Nathaniel", "John", "James","Jim"], "Saturday 12th Feb 2025", "08:00 - 10:00", "Sports Training Village, Bath, BA2 7JX"],
    ["Indoor Tennis", [ "John", "James"], "Saturday 12th Feb 2025", "08:00 - 10:00", "Sports Training Village, Bath, BA2 7JX"],
    ["Indoor Tennis", ["Nathaniel", "John", "James"], "Saturday 12th Feb 2025", "08:00 - 10:00", "Sports Training Village, Bath, BA2 7JX"],
  ];

  const toggleButton = (index, type) => {
    setButtonStates(prevState => {
      const newState = [...prevState];
      if (type === 'check') {
        newState[index] = {
          checkSelected: !newState[index].checkSelected,
          cancelSelected: false, // Unselect cancel if check is selected
        };
      } else {
        newState[index] = {
          checkSelected: false,
          cancelSelected: !newState[index].cancelSelected,
        };
      }
      return newState;
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: background_color }}>
      {/* Top Menu App Bar */}
      <View style={styles.titleContainer}>
        <MaterialIcons.Button name="person" size={28} color={primary_color} backgroundColor="transparent" nPress={() => router.push('/profile')} />
        <ThemedText type="title">BathLink</ThemedText>
        <MaterialIcons.Button name="notifications" size={28} color={primary_color} backgroundColor="transparent" onPress={() => {testBtn}} />
      </View>



      {/* Tabs */}
      <View style={styles.tabContainer}>
        {[ 'Invitations', 'Preferences'].map(tab => (
          <TouchableOpacity key={tab} onPress={() => setSelectedTab(tab)}>
            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextSelected]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Matches List */}
      <ScrollView style={styles.matchList}>
        {matches.map((match, index) => (
          <View key={index} style={styles.matchCard}>
            <Text style={styles.matchTitle}>{match[0]}</Text>
            <Text style={styles.matchDetail}>With {match[1].join(', ')}</Text>
            <Text style={styles.matchDetail}>{match[2]} {match[3]}</Text>
            <Text style={styles.matchDetail}>{match[4]}</Text>
            <View style={styles.buttonRow}>
              <TouchableHighlight
                underlayColor="#ddd"
                style={[
                  styles.iconContainer,
                  buttonStates[index].checkSelected && styles.iconSelectedCheck,
                ]}
                onPress={() => toggleButton(index, 'check')}
              >
                <MaterialIcons
                  name="check-circle"
                  size={30}
                  color={buttonStates[index].checkSelected ? "#fff" : "#5e4bb7"}
                />
              </TouchableHighlight>

              <TouchableHighlight
                underlayColor="#ddd"
                style={[
                  styles.iconContainer,
                  buttonStates[index].cancelSelected && styles.iconSelectedCancel,
                ]}
                onPress={() => toggleButton(index, 'cancel')}
              >
                <MaterialIcons
                  name="cancel"
                  size={30}
                  color={buttonStates[index].cancelSelected ? "#fff" : "#b79dcf"}
                />
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
    borderBottomColor: '#ccc',
  },
  tabText: {
    fontSize: 16,
    color: '#777',
  },
  tabTextSelected: {
    color: '#000',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 4,
  },
  matchList: {
    paddingHorizontal: 16,
  },
  matchCard: {
    backgroundColor: '#f5f5fa',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  matchDetail: {
    fontSize: 14,
    color: '#333',
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

