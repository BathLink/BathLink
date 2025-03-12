import { View, Text, TextInput, Button, StyleSheet, Image, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Divider } from 'react-native-paper';
import { Svg, Path } from 'react-native-svg';



import { ThemedText } from '@/components/ThemedText';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNavigation } from '@react-navigation/native';




export default function ProfileScreen() {


  const colorScheme = useColorScheme();
  let primary_color = "black"
  let background_color = "white"
  let transparent_color = "rgba(0, 0, 0, 0)"

  if (colorScheme === 'dark') {
    primary_color = "white"
    background_color = "rgba(0, 0, 0, 0)"
  } else {
    primary_color = "black"
    background_color = "rgba(0, 0, 0, 0)"
  }


  const testBtn = () => {
    console.log('Button pressed');
  };

  const router = useRouter();

  return (

    <View style={styles.container}>
          {/* Profile Header */}
          <View style={styles.header}>
            <View style={styles.profileImageContainer}>
              <Image style={styles.profileImage} source={{ uri: "https://via.placeholder.com/100" }} />
              <TouchableOpacity style={styles.editIcon}>
                <MaterialIcons name="edit" size={20} color="black" />
              </TouchableOpacity>
            </View>
            <Text style={styles.profileTitle}>My Profile</Text>
          </View>



      <TextInput style={styles.input} placeholder="Name" />
      <TextInput style={styles.input} placeholder="Description" />
      <TextInput style={styles.input} placeholder="Gender" />
      <TextInput style={styles.input} placeholder="Pronouns" />
      <TextInput style={styles.input} placeholder="Date of Birth" />
      <TextInput style={styles.input} placeholder="Phone Number" />
      <TextInput style={styles.input} placeholder="Email" />
      <TextInput style={styles.input} placeholder="Confirm Email" />
      <Button title="Save" onPress={() => alert('Profile Saved!')} />

    </View>
);

};
const styles = StyleSheet.create({
container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  input: { width: '100%', padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 5 },

  // Profile Header Styles
  header: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#f8edf8",
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  profileImageContainer: {
    position: "relative",
    width: 100,
    height: 100,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 5,
    elevation: 3,
  },

  // Section Styles
  section: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6c5b7b",
    marginBottom: 10,
  },

  // Info Rows
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
  value: {
    fontSize: 16,
    color: "#999",
  },

  // Button Styles
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: "#6c5b7b",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },

});