import { View, Text, Modal, StyleSheet,Switch, Pressable, ScrollView, TouchableHighlight, TouchableOpacity, Alert } from 'react-native';
import {useState, useEffect, useRef} from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from 'aws-amplify/auth';
import { getInfo } from '@/authentication/getInfo';
import { putItem } from '@/authentication/putInfo';
import {deleteItem} from '@/authentication/deleteInfo';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/useColorScheme';
import colours from '../colours';



export default function HomeScreen() {
  const theme = useColorScheme();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [allMatches, setAllMatches] = useState([])
    const [selectedTab, setSelectedTab] = useState('Invitations');

    const [toggles, setToggles] = useState<{ [key: string]: boolean }>({});
    const [preferences, setPreferences] = useState({});
    const [activities, setActivities] = useState<any[]>([]);

  const appStartTimeRef = useRef(Date.now());
  const logButtonPress = (buttonName: string) => {
    const now = Date.now();
    const relTime = ((now - appStartTimeRef.current) / 1000).toFixed(2);
    console.log(`[LOG] Button "${buttonName}" pressed at +${relTime}s`);
  };

  // Track which button is selected for each match
  const [buttonStates] = useState(
    Array(5).fill({ checkSelected: false, cancelSelected: false })
  );

  const router = useRouter();


  const toggleSwitch = async (activityId: string) => {
          logButtonPress(`Toggle Activity ${activityId}`);
          try {
              const {userId} = await getCurrentUser();
              const userPreferences: any = await getInfo(`users/${userId}/preferences`);
              let currentActivities = userPreferences.activities || [];

              let updatedActivities;
              if (currentActivities.includes(activityId)) {
                  // Toggle OFF: Remove activityId
                  updatedActivities = currentActivities.filter(id => id !== activityId);
              } else {
                  // Toggle ON: Add activityId
                  updatedActivities = [...currentActivities, activityId];
              }

              // Update backend
              const activities: any = {}
              activities[activityId] = !currentActivities.includes(activityId);
              const response  = await putItem(`users/${userId}/preferences`, activities);


              const updatedPreferences: any = await getInfo(`users/${userId}/preferences`);

              // Update UI state correctly
              setToggles(prev => ({
                  ...prev,
                  [activityId]: !prev[activityId] // Correctly toggles individual switches
              }));

          } catch (error) {
              console.error("Error updating preference:", error);
          }
      };

      useEffect(() => {
          const loadActivityList = async () => {
              try {
                  const activityResponse: any = await getInfo("/activities");
                  console.log("Activity Response:", activityResponse);

                  const { userId } = await getCurrentUser();
                  const userPreferences: any = await getInfo(`users/${userId}/preferences`);
                  const userActivityIds = userPreferences.activities || [];

                  const seenActivities = new Set();
                  const duplicates = [];

                  activityResponse.forEach(activity => {
                      const key = `${activity.activity_name}-${activity.ability}-${activity.number_of_people}`;

                      if (seenActivities.has(key)) {
                          duplicates.push(activity);
                      } else {
                          seenActivities.add(key);
                      }
                  });

  // Log duplicates
                  if (duplicates.length > 0) {
                      console.log("Duplicate Activities Found:", duplicates);
                  } else {
                      console.log("No duplicates found.");
                  }


                  if (Array.isArray(activityResponse)) {
                      // Define ability sorting order
                      const abilityOrder: { [key: string]: number } = {
                          beginner: 1,
                          intermediate: 2,
                          advanced: 3
                      };

                      // Sort activities based on multiple criteria
                      const sortedActivities = [...activityResponse].sort((a, b) => {
                          // 1. Sort by activity_name (A → Z)
                          const nameComparison = a.activity_name.localeCompare(b.activity_name);
                          if (nameComparison !== 0) return nameComparison;

                          // 2. Sort by ability order (Beginner → Intermediate → Advanced)
                          const abilityA = abilityOrder[a.ability?.toLowerCase()] || 4; // Default to last place if missing
                          const abilityB = abilityOrder[b.ability?.toLowerCase()] || 4;
                          if (abilityA !== abilityB) return abilityA - abilityB;

                          // 3. Sort by number_of_people (small → large)
                          return (a.number_of_people || 0) - (b.number_of_people || 0);
                      });

                      const uniqueActivities = sortedActivities.filter((activity, index, self) =>
                              index === self.findIndex((a) =>
                                  a.activity_name === activity.activity_name &&
                                  a.ability === activity.ability &&
                                  a.number_of_people === activity.number_of_people
                              )
                      );
                      setActivities(uniqueActivities);

                      //setActivities(sortedActivities); // Store sorted activities in state

                      // Initialize toggles based on user preferences
                      const initialToggles: { [key: string]: boolean } = {};
                      sortedActivities.forEach(activity => {
                          initialToggles[activity["activity-id"]] = userActivityIds.includes(activity["activity-id"]);
                      });

                      setToggles(initialToggles);
                  } else {
                      console.error("Invalid API response format:", activityResponse);
                  }
              } catch (error) {
                  console.error("Error fetching preferences:", error);
              }
          };



          loadActivityList();
      }, []);

  async function getMatches() {
      try {
          const { userId } = await getCurrentUser();
          const dbMeetups = await getInfo("users/"+userId+"/meetups");
          return dbMeetups;
      } catch (error) {
          console.error("Error fetching matches:", error);
          return { matches: [] }; // Ensure it returns a default structure to prevent errors
      }
  }

  //to format date of meetup
  function formatMeetupDate(dateString) {
    const date = new Date(dateString);

    const options = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };

    return new Intl.DateTimeFormat('en-GB', options).format(date)
        .replace(',', '') // Remove the default comma
        .replace(/(\d{1,2}) /, (match, p1) => `${p1}th `); // Add "th" to the day
  }

  async function getName(ids: string | any[]) {
    try {
        let names: string | [] = []
        for (let i = 0; i < ids.length; i++) {
          let userDetails = await getInfo(`users/${ids[i]}`)
          names.push(userDetails.name)
        }
        return names

    } catch (error) {
        console.error("Error fetching matches:", error);
        return []
    }
}

async function acceptMeetup(meetupId) {
    logButtonPress(`Accept Meetup ${meetupId}`);
    try {
      const { userId } = await getCurrentUser();
      await putItem(`meetups/${meetupId}`, {userId: userId});
  } catch (error) {
      console.error("Error fetching matches:", error);
      return { matches: [] }; // Ensure it returns a default structure to prevent errors
  }
}

async function declineMeetup(meetupId) {
  logButtonPress(`Decline Meetup ${meetupId}`);
  try {
    const { userId } = await getCurrentUser();
    await deleteItem(`meetups/${meetupId}`, `{userId: ${userId}}`);
  } catch (error) {
      console.error("Error fetching matches:", error);
      return { matches: [] }; // Ensure it returns a default structure to prevent errors
  }
}

  async function processMatches(dbMeetups) {
    try {
      let meetups = await dbMeetups.meetups.filter(meetup => !meetup.confirmed)
      let formatedMeetups = []
      for (let i = 0; i < meetups.length; i++) {
        let meetup = meetups[i]
        let id = meetup["meetup-id"]
        let title = meetup.activity
        let people = (await getName(meetup.participants))
        let date = formatMeetupDate(meetup.time_slot)
        let noPplAccepted = meetup.confirmed_users.length.toString()
        formatedMeetups.push([id, title, people, date, noPplAccepted])
      }
      return formatedMeetups

        }
        catch (e) {
            console.log("carrot")
          console.log(e)
            console.log("carrot")
          return []
        }
    
  }

    useEffect(() => {
        const fetchMeetups = async () => {
            try {
                const meetupsData = await getMatches();
                const processedMatches = await processMatches(meetupsData);
                setAllMatches(processedMatches);
            } catch (error) {
                console.error("Error processing meetups:", error);
                console.log("pineapple")
            }
        };

        fetchMeetups();

        const intervalId = setInterval(fetchMeetups, 1000);

        // Clear the interval when the component unmounts
        return () => clearInterval(intervalId);

    }, []); 

  const profileBtn = async () => {
      logButtonPress("Profile");
      await AsyncStorage.setItem("page", "/matches");
      router.replace('/profile')
  };

  const selectMeetup = (meetup) => {
    logButtonPress(`Select Meetup ${meetup[0]}`);
    setSelectedMatch(meetup);
  };

  const closeMeetup = () => {
    logButtonPress("Close Meetup Modal");
    setSelectedMatch(null);
  };

    return (
        <View style={{ flex: 1, backgroundColor: colours[theme].background }}>
            {/* Top Menu App Bar */}
            <View style={styles.titleContainer}>
                <MaterialIcons.Button
                    name="person" size={28} color={colours[theme].text}
                    backgroundColor="transparent" onPress={profileBtn}
                />
                <Text style={[styles.header, { color: colours[theme].text }]}>
                    BathLink
                </Text>
                <MaterialIcons.Button
                    name="notifications" size={28} color="transparent"
                    backgroundColor="transparent"
                />
            </View>

            {/* Tabs */}
            <View style={[styles.tabContainer, { color: colours[theme].text }]}>
                {['Invitations', 'Preferences'].map(tab => (
                    <TouchableOpacity key={tab} onPress={() => { logButtonPress(`Tab: ${tab}`); setSelectedTab(tab); }}>
                        <Text style={[
                            styles.tabText , {color: colours[theme].text},
                            selectedTab === tab && { ...styles.tabTextSelected, borderBottomColor: colours[theme].text
                            ,color: colours[theme].text }
                        ]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Invitations Tab */}
            {selectedTab === 'Invitations' && (
                <ScrollView style={styles.matchList}>
                    {allMatches.map((match, index) => (
                        <Pressable key={match[0]} onPress={() => { logButtonPress(`Open Meetup ${match[0]}`); selectMeetup(match); }}>
                            <View style={[styles.matchCard, { backgroundColor: colours[theme].secondary }]}>
                                <Text style={[styles.matchTitle, { color: colours[theme].text }]}>{match[1]}</Text>
                                <Text style={[styles.matchDetail, { color: colours[theme].text }]}>
                                    With {match[2].length > 1 ? match[2].join(", ") : match[2]}
                                </Text>
                                <Text style={[styles.matchDetail, { color: colours[theme].text }]}>{match[3]}</Text>

                                <View style={styles.buttonRow}>
                                    <TouchableHighlight
                                        underlayColor="#ddd"
                                        style={[
                                            styles.iconContainer,
                                            buttonStates[index]?.checkSelected && styles.iconSelectedCheck,
                                        ]}
                                        onPress={() => { logButtonPress(`Accept Meetup Icon ${match[0]}`); acceptMeetup(match[0]); }}
                                    >
                                        <MaterialIcons name="check-circle" size={30} color={colours[theme].primary} />
                                    </TouchableHighlight>

                                    <TouchableHighlight
                                        underlayColor="#ddd"
                                        style={[
                                            styles.iconContainer,
                                            buttonStates[index]?.cancelSelected && styles.iconSelectedCancel,
                                        ]}
                                        onPress={() => { logButtonPress(`Decline Meetup Icon ${match[0]}`); declineMeetup(match[0]); }}
                                    >
                                        <MaterialIcons name="cancel" size={30} color={colours[theme].primary} />
                                    </TouchableHighlight>
                                </View>
                            </View>
                        </Pressable>
                    ))}
                </ScrollView>
            )}

            {/* Preferences Tab */}
            {selectedTab === 'Preferences' && (
                <ScrollView style={[styles.matchList, { color: colours[theme].text }]}>
                    {activities.map((activity) => (
                        <View key={activity["activity-id"]} style={[styles.preferenceItem, { color: colours[theme].text }]}>
                            <Text style={[ { color: colours[theme].text }]}>{`${activity.activity_name} (${activity.ability}, ${activity.number_of_people} people)`}</Text>
                            <Switch
                                value={toggles[activity["activity-id"]] || false}
                                onValueChange={() => { logButtonPress(`Toggle Activity Switch ${activity["activity-id"]}`); toggleSwitch(activity["activity-id"]); }}
                            />
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* Expanded Meetup Modal */}
            {selectedMatch && (
                <Modal animationType="fade" transparent={true} visible={!!selectedMatch}>
                    <Pressable style={styles.modalOverlay} onPress={() => { logButtonPress("Close Meetup Modal (overlay)"); closeMeetup(); }}>
                        <View style={[styles.expandedMeetup, { backgroundColor: colours[theme].secondary }]}>
                            <Text style={[styles.expandedTitle, { color: colours[theme].text }]}>{selectedMatch[1]}</Text>
                            <Text style={[styles.expandedDetail, { color: colours[theme].text }]}>📅 {selectedMatch[3]}</Text>
                            <Text style={[styles.expandedDetail, { color: colours[theme].text }]}>👤 {selectedMatch[2].length > 1 ? selectedMatch[2].join(", ") : selectedMatch[2]}</Text>
                            <MaterialIcons name="image" size={60} color="gray" style={styles.expandedImage} />
                            <Pressable onPress={() => { logButtonPress("Close Meetup Modal (button)"); closeMeetup(); }} style={styles.closeButton}>
                                <Text style={[styles.closeButtonText, { color: colours[theme].text }]}>Close</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Modal>
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
  subheader: {
    fontSize: 25,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
    iconContainer: {borderRadius: 20, padding: 4},
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginVertical: 10,
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
  tabTextSelected: {
    fontWeight: 'bold',
    borderBottomWidth: 2,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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

  expandedMeetup: {
    width: '85%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  expandedTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  expandedDetail: {
    fontSize: 16,
    marginVertical: 5,
  },
  expandedImage: {
    marginVertical: 10,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButtonText: {
    fontSize: 16,
  },
    preferenceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
});