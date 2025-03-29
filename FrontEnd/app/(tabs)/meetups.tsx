import { FlatList, View, StyleSheet, Text, Pressable, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getInfo } from '@/authentication/getInfo';
import { getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import colours from '../colours';
import { useColorScheme } from '@/hooks/useColorScheme';


export default function MeetupsScreen() {
  const [selectedMeetup, setSelectedMeetup] = useState(null);
  const [allMeetups, setAllMeetups] = useState([])
  const router = useRouter();

  const theme = useColorScheme();
  
  // replace this code with real data
  async function getMeetups() {
      try {
          const { userId } = await getCurrentUser();
          console.log("User ID:", userId);

          const dbMeetups = await getInfo(`users/${userId}/meetups`);
          return dbMeetups;
      } catch (error) {
          console.error("Error fetching meetups:", error);
          return { meetups: [] }; // Ensure it returns a default structure to prevent errors
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


  async function processMeetups(dbMeetups) {
      return dbMeetups.meetups
          .filter(meetup => meetup.confirmed)
          .map((meetup, index) => ({
              id: (index + 1).toString(),
              title: meetup.activity,
              description: formatMeetupDate(meetup.time_slot),
              noPplAccepted: meetup.confirmed_users.length.toString(),
          }));
  }

  useEffect(() => {
      const fetchMeetups = async () => {
          try {
              const meetupsData = await getMeetups();
              const processedMeetups = await processMeetups(meetupsData);
              setAllMeetups(processedMeetups);
          } catch (error) {
              console.error("Error processing meetups:", error);
          }
      };

      fetchMeetups();
  }, []); 

  const selectMeetup = (meetup) => {
    setSelectedMeetup(meetup);
  };

  const closeMeetup = () => {
    setSelectedMeetup(null);
  };

  const profileBtn = async () => {
    await AsyncStorage.setItem("page", "/meetups");
    router.replace('/profile')
  };

  const renderHeader = () => (
    <View           
    style={[{
      backgroundColor: colours[theme].background
    }]} 
    >
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

      {/* Subheader */}
      <Text 
      style={[
        styles.subheader, 
        { 
          color: colours[theme].text, 
          backgroundColor: "transparent",
        }
      ]}
      >
        Meetups
      </Text>

      {/* Next Meetup (First item) */}
      {allMeetups.length > 0 ? (
        <View>
          <Text 
          style={[styles.subsubheader, { color: colours[theme].text }]}>
            Next Meetup
          </Text>
          <Pressable onPress={() => selectMeetup(allMeetups[0])}>
            <View style={[styles.meetupBox, { backgroundColor: colours[theme].secondary, borderColor: colours[theme].surface }]} >
              <View style={styles.meetupTextContainer}>
                <Text style={[styles.meetupTitle, { color: colours[theme].text }]}>{allMeetups[0].title}</Text>
                <Text style={[styles.meetupDescription, { color: colours[theme].text }]}>{allMeetups[0].description}</Text>
              </View>
              <MaterialIcons name="image" size={30} color="gray" style={styles.meetupImage} />
            </View>
          </Pressable>
        </View>
      ) : 
      <View>
        <Text style={[styles.subsubheader, { color: colours[theme].text }]}>
          No Meetups Found - See matches page to organise meetups
        </Text>
      </View>
      }

      {/* Other Meetups Header */}
      {allMeetups.length > 1 && <Text style={[styles.subsubheader, { color: colours[theme].text }]}>Other Meetups</Text>}
    </View>
  );

  return (
    <View style={[{
      flex: 1,
      backgroundColor: colours[theme].background
    }]}>
      <FlatList
        data={allMeetups.slice(1)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => selectMeetup(item)}>
            <View style={[styles.meetupBox, { backgroundColor: colours[theme].secondary, borderColor: colours[theme].surface }]} >
              <View style={styles.meetupTextContainer}>
                <Text style={[styles.meetupTitle, { color: colours[theme].text }]}>{item.title}</Text>
                <Text style={[styles.meetupDescription, { color: colours[theme].text }]}>{item.description}</Text>
              </View>
              <MaterialIcons name="image" size={30} color="gray" style={styles.meetupImage} />
            </View>
          </Pressable>
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Expanded Meetup Modal */}
      {selectedMeetup && (
        <Modal animationType="fade" transparent={true} visible={!!selectedMeetup}>
          <Pressable style={styles.modalOverlay} onPress={closeMeetup}>
            <View style={[styles.expandedMeetup, { backgroundColor: colours[theme].secondary }]}>
              <Text style={[styles.expandedTitle, { color: colours[theme].text }]}>{selectedMeetup.title}</Text>
              <Text style={[styles.expandedDetail, { color: colours[theme].text }]}>📅 {selectedMeetup.description}</Text>
              <Text style={[styles.expandedDetail, { color: colours[theme].text }]}>👤 {selectedMeetup.noPplAccepted}</Text>
              <MaterialIcons name="image" size={60} color="gray" style={styles.expandedImage} />
              <Pressable onPress={closeMeetup} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
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
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  subheader: {
    fontSize: 25,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  subsubheader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  meetupBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 0,
    elevation: 1,
  },
  meetupTextContainer: {
    flex: 1,
    flexDirection: 'column',
    paddingRight: 10,
  },
  meetupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  meetupDescription: {
    fontSize: 14,
  },
  meetupImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
