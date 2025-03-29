import { FlatList, View, Text, Button, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme();

  let primary_color = colorScheme === 'dark' ? 'white' : 'black';
  let transparent_color = 'rgba(0, 0, 0, 0)';
  let meetupBoxColor = colorScheme === 'dark' ? '#333' : '#FCFAFF';
  let meetupBorderColor = colorScheme === 'dark' ? '#555' : 'transparent';

  const router = useRouter();
  const testBtn = () => {
    console.log('Button pressed');
  };

  // Sample meetups list
  const meetups = [
    { id: '1', title: 'Indoor Tennis', description: 'Saturday 12th Feb 2025  08:00 - 10:00' },
    { id: '2', title: 'Indoor Tennis', description: 'Saturday 12th Feb 2025  08:00 - 10:00' },
    { id: '3', title: 'Indoor Tennis', description: 'Saturday 12th Feb 2025  08:00 - 10:00' },
    { id: '4', title: 'Indoor Tennis', description: 'Saturday 12th Feb 2025  08:00 - 10:00' },
    { id: '5', title: 'Indoor Tennis', description: 'Saturday 12th Feb 2025  08:00 - 10:00' },
    { id: '6', title: 'Indoor Tennis', description: 'Saturday 12th Feb 2025  08:00 - 10:00' },
    { id: '7', title: 'Indoor Tennis', description: 'Saturday 12th Feb 2025  08:00 - 10:00' },
    { id: '8', title: 'Indoor Tennis', description: 'Saturday 12th Feb 2025  08:00 - 10:00' },

  ];

  const profileBtn = async () => {
      await AsyncStorage.setItem("page", "/meetups");
      router.replace('/profile')
  };

  // Header component for static content
  const renderHeader = () => (
    <View>
      {/* Top Menu App Bar */}
      <View style={styles.titleContainer}>
    <MaterialIcons.Button name="person" size={28} color={primary_color} backgroundColor={transparent_color} onPress={profileBtn}/>
        <ThemedText type="title" >BathLink</ThemedText>
        <MaterialIcons.Button name="notifications" size={28} color={transparent_color} backgroundColor={transparent_color} onPress={testBtn}/>
      </View>

      {/* Subheader: Meetups */}
      <Text style={[styles.subheader, { color: primary_color }]}>Meetups</Text>

      {/* Next Meetup */}
      {meetups.length > 0 && (
        <View>
          <Text style={[styles.subsubheader, { color: primary_color }]}>Next Meetup</Text>
          <View style={[styles.meetupBox, { backgroundColor: meetupBoxColor, borderColor: meetupBorderColor }]}>
            {/* Text Section */}
            <View style={styles.meetupTextContainer}>
              <Text style={[styles.meetupTitle, { color: primary_color }]}>{meetups[0].title}</Text>
              <Text style={[styles.meetupDescription, { color: primary_color }]}>{meetups[0].description}</Text>
            </View>
            {/* Image Placeholder */}
            <MaterialIcons name="image" size={30} color="gray" style={styles.meetupImage} />
          </View>
        </View>
      )}

      {/* Other Meetups Header */}
      {meetups.length > 1 && (
        <Text style={[styles.subsubheader, { color: primary_color }]}>Other Meetups</Text>
      )}

      {/* Subheader: Meetups */}
      <Text style={[styles.subheader, { color: primary_color }]}>Meetups</Text>

      {/* Next Meetup */}
      {meetups.length > 0 && (
        <View>
          <Text style={[styles.subsubheader, { color: primary_color }]}>Next Meetup</Text>
          <View style={[styles.meetupBox, { backgroundColor: meetupBoxColor, borderColor: meetupBorderColor }]}>
            {/* Text Section */}
            <View style={styles.meetupTextContainer}>
              <Text style={[styles.meetupTitle, { color: primary_color }]}>{meetups[0].title}</Text>
              <Text style={[styles.meetupDescription, { color: primary_color }]}>{meetups[0].description}</Text>
            </View>
            {/* Image Placeholder */}
            <MaterialIcons name="image" size={30} color="gray" style={styles.meetupImage} />
          </View>
        </View>
      )}

      {/* Other Meetups Header */}
      {meetups.length > 1 && (
        <Text style={[styles.subsubheader, { color: primary_color }]}>Other Meetups</Text>
      )}
    </View>
  );



  return (
    <FlatList
      data={meetups.slice(1)} // Start with the second item as we already display the first one above
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={[styles.meetupBox, { backgroundColor: meetupBoxColor, borderColor: meetupBorderColor }]}>
          {/* Text Section */}
          <View style={styles.meetupTextContainer}>
            <Text style={[styles.meetupTitle, { color: primary_color }]}>{item.title}</Text>
            <Text style={[styles.meetupDescription, { color: primary_color }]}>{item.description}</Text>
          </View>
          {/* Image Placeholder */}
          <MaterialIcons name="image" size={30} color="gray" style={styles.meetupImage} />
        </View>
      )}
      ListHeaderComponent={renderHeader} // Add static header
      contentContainerStyle={{ paddingBottom: 20 }} // Adds spacing at the bottom
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensures the FlatList takes up the full height
  },

      scrollContainer: {

        backgroundColor: '#f8f4ff',
        width: "100%",
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center', // Ensures inputs stay centered
        paddingVertical: 20, // Prevents inputs from getting too close to the screen edges
      },
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
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1, // Shadow for Android
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
    color: 'gray',
  },
  meetupImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
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
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1, // Shadow for Android
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
    color: 'gray',
  },
  meetupImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});
