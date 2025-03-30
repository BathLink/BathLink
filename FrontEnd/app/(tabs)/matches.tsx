import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Switch, TouchableHighlight } from 'react-native';
import {useEffect, useState} from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/useColorScheme';
import {ThemedText} from "@/components/ThemedText";
import {getInfo} from '@/authentication/getInfo';
import {getCurrentUser} from "aws-amplify/auth";


export default function MatchesScreen() {
  const colorScheme = useColorScheme();
  const [selectedTab, setSelectedTab] = useState('Invitations');
  const [activityNames, setActivityNames] = useState<string[]>([]);
  const [toggles, setToggles] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const loadActivityList = async () => {
      const activityResponse: any = await getInfo("/activities");

      if (Array.isArray(activityResponse)) {
        const names = activityResponse.map(activity => activity.activity_name);
        setActivityNames(names);
        console.log(activityResponse);


        const initialToggles: { [key: string]: boolean } = {};
        names.forEach((name) => (initialToggles[name] = false));
        setToggles(initialToggles);
      } else {
        console.error("Invalid API response format:", activityResponse);
      }
    };

    loadActivityList();
  }, []);

  useEffect(() => {
    console.log("Updated activityNames:", activityNames);
  }, [activityNames]);



  const [buttonStates, setButtonStates] = useState(
      Array(5).fill({ checkSelected: false, cancelSelected: false })
  );

  const toggleButton = (index:any, type:any) => {
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

  const toggleSwitch = (activity: string) => {
    setToggles((prev) => ({
      ...prev,
      [activity]: !prev[activity],
    }));
  };

  const router = useRouter();
  const primary_color = colorScheme === 'dark' ? 'white' : 'black';
  const background_color = colorScheme === 'dark' ? 'rgba(0, 0, 0, 0)' : 'rgba(255, 255, 255, 1)';

  const testBtn = () => {
    console.log('Button pressed');
  };

  const profileBtn = async () => {
      await AsyncStorage.setItem("page", "/matches");
      router.replace('/profile')
  };

  const matches = [
    ["Indoor Tennis", ["Nathaniel", "John",], "Saturday 12th Feb 2025", "08:00 - 10:00", "Sports Training Village, Bath, BA2 7JX"],
    ["Indoor Tennis", ["Nathaniel", "John", "James"], "Saturday 12th Feb 2025", "08:00 - 10:00", "Sports Training Village, Bath, BA2 7JX"],
    ["Outdoor Tennis", ["Nathaniel", "John", "James","Jim"], "Saturday 12th Feb 2025", "08:00 - 10:00", "Sports Training Village, Bath, BA2 7JX"],
    ["Indoor Tennis", [ "John", "James"], "Saturday 12th Feb 2025", "08:00 - 10:00", "Sports Training Village, Bath, BA2 7JX"],
    ["Indoor Tennis", ["Nathaniel", "John", "James"], "Saturday 12th Feb 2025", "08:00 - 10:00", "Sports Training Village, Bath, BA2 7JX"],
  ];

  //const togglePreference = (activity:any) => {
   // setPreferences(prev => ({ ...prev, [activity]: !prev[activity] }));
  //};

  return (
      <View style={{ flex: 1, backgroundColor: background_color }}>
      {/* Top Menu App Bar */}
      <View style={styles.titleContainer}>
        <MaterialIcons.Button name="person" size={28} color={primary_color} backgroundColor="transparent" onPress={profileBtn} />
        <ThemedText type="title">BathLink</ThemedText>
        <MaterialIcons.Button name="notifications" size={28} color={"transparent"} backgroundColor="transparent" onPress={() => {testBtn}} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['Invitations', 'Preferences'].map(tab => (
          <TouchableOpacity key={tab} onPress={() => setSelectedTab(tab)}>
            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextSelected]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Invitations List */}
      {selectedTab === 'Invitations' ? (
        <ScrollView style={styles.listContainer}>
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
          //</View>
        ))}
      </ScrollView>
      ) : (
        <ScrollView style={styles.listContainer}>
          {activityNames.map((activity) => (
              <View key={activity} style={styles.preferenceItem}>
                <Text style={styles.preferenceText}>{activity}</Text>
                <Switch value={toggles[activity]} onValueChange={() => toggleSwitch(activity)} />
              </View>
          ))}
        </ScrollView>
      )}
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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
  listContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
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
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  preferenceText: {
    fontSize: 16,
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 16,
  },
});
