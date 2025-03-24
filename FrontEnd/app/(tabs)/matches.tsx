import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableHighlight, TouchableOpacity, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [selectedTab, setSelectedTab] = useState('Matches');

  // Matches state (to dynamically remove items)
  const [matches, setMatches] = useState([
    ["Indoor Tennis", ["Nathaniel", "John"], "Saturday 12th Feb 2025", "08:00 - 10:00", "Sports Training Village, Bath, BA2 7JX"],
    ["Indoor Tennis", ["Nathaniel", "John", "James"], "Saturday 12th Feb 2025", "08:00 - 10:00", "Sports Training Village, Bath, BA2 7JX"],
    ["Outdoor Tennis", ["Nathaniel", "John", "James", "Jim"], "Saturday 12th Feb 2025", "08:00 - 10:00", "Sports Training Village, Bath, BA2 7JX"],
    ["Indoor Tennis", ["John", "James"], "Saturday 12th Feb 2025", "08:00 - 10:00", "Sports Training Village, Bath, BA2 7JX"],
    ["Indoor Tennis", ["Nathaniel", "John", "James"], "Saturday 12th Feb 2025", "08:00 - 10:00", "Sports Training Village, Bath, BA2 7JX"],
  ]);

  const primary_color = colorScheme === 'dark' ? 'white' : 'black';
  const background_color = colorScheme === 'dark' ? 'rgba(0, 0, 0, 0)' : 'rgba(0, 0, 0, 0)';

  const toggleButton = (index, type) => {
    setMatches(prevMatches => {
      const updatedMatches = [...prevMatches];
      const [match] = updatedMatches.splice(index, 1); // remove match

      if (type === 'check') {
        alert(`You confirmed: ${match[0]} with ${match[1].join(', ')}`);

      } else {
        alert(`You cancelled: ${match[0]} with ${match[1].join(', ')}`);

      }

      return updatedMatches;
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: background_color }}>
      {/* Top Menu App Bar */}
      <View style={styles.titleContainer}>
        <MaterialIcons.Button name="person" size={28} color={primary_color} backgroundColor="transparent" onPress={() => {}} />
        <ThemedText type="title">BathLink</ThemedText>
        <MaterialIcons.Button name="notifications" size={28} color={primary_color} backgroundColor="transparent" onPress={() => {}} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['Matches', 'Invitations', 'Preferences'].map(tab => (
          <TouchableOpacity key={tab} onPress={() => setSelectedTab(tab)}>
            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextSelected]}>
              {tab}
            </Text>
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
    backgroundColor: '#333333',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  matchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#ffffff'
  },
  matchDetail: {
    fontSize: 16,
    color: '#ffffff',
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
});



