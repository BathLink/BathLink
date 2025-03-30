import { View, Text, Modal, StyleSheet, Pressable, ScrollView, TouchableHighlight } from 'react-native';
import {useState, useEffect} from 'react';
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


  // Track which button is selected for each match
  const [buttonStates] = useState(
    Array(5).fill({ checkSelected: false, cancelSelected: false })
  );

  const router = useRouter();

  async function getMatches() {
      try {
          const { userId } = await getCurrentUser();
          const dbMeetups = await getInfo(`users/${userId}/meetups`);
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
    try {
      const { userId } = await getCurrentUser();
      await putItem(`meetups/${meetupId}`, `{userId: ${userId}}`);
  } catch (error) {
      console.error("Error fetching matches:", error);
      return { matches: [] }; // Ensure it returns a default structure to prevent errors
  }
}

async function declineMeetup(meetupId) {
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
        console.log(meetups)
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
          console.log(e)
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
            }
        };

        fetchMeetups();

    }, []); 

  const profileBtn = async () => {
      await AsyncStorage.setItem("page", "/matches");
      router.replace('/profile')
  };

  const selectMeetup = (meetup) => {
    setSelectedMatch(meetup);
  };

  const closeMeetup = () => {
    setSelectedMatch(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colours[theme].background }}>
{/* Top Menu App Bar */}
<View style={styles.titleContainer}>
        <MaterialIcons.Button
          name="person" 
          size={28} 
          color= {colours[theme].text}
          backgroundColor="rgba(0,0,0,0)"
          onPress={profileBtn}
        />

        <Text 
        style={[styles.header,{
          color: colours[theme].text, 
          backgroundColor: "rgba(0,0,0,0)",
        }]} 
        >
          BathLink
        </Text>

        <MaterialIcons.Button
          name="notifications"
          size={28}           
          color= "rgba(0,0,0,0)"
          backgroundColor="rgba(0,0,0,0)"
        />
      </View>
      {/* End of top Menu App Bar */}

      <Text 
      style={[
        styles.subheader, 
        { 
          color: colours[theme].text, 
          backgroundColor: "transparent",
        }
      ]}
      >
        Matches
      </Text>

      {/* Matches List */}
      <ScrollView style={styles.matchList}>
        {allMatches.map((match, index) => (
          <Pressable onPress={() => selectMeetup(match)}>
          <View key={index} style={[styles.matchCard, {backgroundColor: colours[theme].secondary}]}>
            <Text style={[styles.matchTitle, {color: colours[theme].text}]}>{match[1]}</Text>
            <Text style={[styles.matchDetail, {color: colours[theme].text}]}>With {match[2].length > 1 ? match[2].join(", ") : match[2]}</Text>
            <Text style={[styles.matchDetail, {color: colours[theme].text}]}>{match[3]}</Text>
            <View style={styles.buttonRow}>
              <TouchableHighlight
                underlayColor="#ddd"
                style={[
                  styles.iconContainer,
                  buttonStates[index].checkSelected && styles.iconSelectedCheck,
                ]}
                onPress={() => acceptMeetup(match[0])}
              >
                <MaterialIcons
                  name="check-circle"
                  size={30}
                  color={colours[theme].primary}
                />
              </TouchableHighlight>

              <TouchableHighlight
                underlayColor="#ddd"
                style={[
                  styles.iconContainer,
                  buttonStates[index].cancelSelected && styles.iconSelectedCancel,
                ]}
                onPress={() => declineMeetup(match[0])}
              >
                <MaterialIcons
                  name="cancel"
                  size={30}
                  color={colours[theme].primary}
                />
              </TouchableHighlight>
            </View>
            
          </View>
          </Pressable>
        ))}
      </ScrollView>
      {selectedMatch && (
        <Modal animationType="fade" transparent={true} visible={!!selectedMatch}>
          <Pressable style={styles.modalOverlay} onPress={closeMeetup}>
            <View style={[styles.expandedMeetup, { backgroundColor: colours[theme].secondary }]}>
              <Text style={[styles.expandedTitle, { color: colours[theme].text }]}>{selectedMatch[1]}</Text>
              <Text style={[styles.expandedDetail, { color: colours[theme].text }]}>📅 {selectedMatch[3]}</Text>
              <Text style={[styles.expandedDetail, { color: colours[theme].text }]}>👤 {selectedMatch[2].length > 1 ? selectedMatch[2].join(", ") : selectedMatch[2]}</Text>
              <MaterialIcons name="image" size={60} color="gray" style={styles.expandedImage} />
              <Pressable onPress={closeMeetup} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, {color: colours[theme].text}]}>Close</Text>
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
});