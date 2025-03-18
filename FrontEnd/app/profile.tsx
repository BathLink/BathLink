import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, Platform, Alert, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";

export default function ProfileScreen() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [formattedDate, setFormattedDate] = useState("");

  // Load profile data from AsyncStorage when the component mounts
  useEffect(() => {
    const loadProfileData = async () => {
      const storedProfile = await AsyncStorage.getItem("profile");
      console.log(storedProfile)
      if (storedProfile) {
        const profileData = JSON.parse(storedProfile);
        setName(profileData.name || "");
        setDescription(profileData.description || "");
        setPronouns(profileData.pronouns || "");
        setPhone(profileData.phone || "");
        setEmail(profileData.email || "");
        setConfirmEmail(profileData.confirmEmail || "");
        setDate(new Date(profileData.dob || new Date()));
        setProfileImage(profileData.profileImage || null);
        setFormattedDate(formatDate(new Date(profileData.dob || new Date())));
      }
    };

    loadProfileData();
  }, []);

  const saveProfile = async () => {
    if ((!email && confirmEmail) || (email && !confirmEmail) || (email !== confirmEmail)) {
      Alert.alert("Error", "Please ensure emails match.");
      return;
    }
    const profileData = { name, description, pronouns, gender, phone, email, confirmEmail, dob: date.toISOString(), profileImage };
    await AsyncStorage.setItem("profile", JSON.stringify(profileData));
    Alert.alert("Success", "Profile saved!");
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow access to upload a profile picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const confirmDateSelection = () => {
    setFormattedDate(formatDate(date));
    setShowPicker(false);
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image style={styles.profileImage} source={profileImage ? { uri: profileImage } : require("../assets/images/default-profile.png")} />
          <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
            <MaterialIcons name="edit" size={20} color="black" />
          </TouchableOpacity>
        </View>
        <Text style={styles.profileTitle}>My Profile</Text>
      </View>

      <TextInput style={styles.input} placeholder="Name" value={name || "Enter your name"} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Description" value={description || "Enter your description"} onChangeText={setDescription} />

      <TextInput style={styles.input} placeholder="Pronouns" value={pronouns || "Enter your pronouns"} onChangeText={setPronouns} />

      {/* Date of Birth Input */}
      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.inputContainer}>
        <Text style={formattedDate ? styles.inputText : styles.placeholderText}>
          {formattedDate || "Date of Birth"}
        </Text>
        <MaterialIcons name="calendar-today" size={24} color="black" />
      </TouchableOpacity>

      {/* Date Picker with Confirm Button */}
      {showPicker && (
        <Modal transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
              />
              <TouchableOpacity style={styles.confirmButton} onPress={confirmDateSelection}>
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      <TextInput style={styles.input} placeholder="Phone Number" value={phone || "Enter your phone number"} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Email" value={email || "Enter your email"} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Confirm Email" value={confirmEmail || "Confirm your email"} onChangeText={setConfirmEmail} keyboardType="email-address" />

      <Button title="Save" onPress={saveProfile} />
    </View>
  );
}
const styles = StyleSheet.create({

  modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: "white",
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
      width: "80%",
    },
    confirmButton: {
      marginTop: 10,
      backgroundColor: "#6c5b7b",
      padding: 10,
      borderRadius: 5,
      alignItems: "center",
      width: "80%",
    },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "white",
  },
pickerContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "white",
    height: 40,
    justifyContent: "center",
  },
  picker: {
    height: 40,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  inputText: {
    fontSize: 16,
  },
  placeholderText: {
    fontSize: 14,
    color: "#aaa",
  },
  inputField: {
    flex: 1,
    paddingVertical: 10,
  },
  icon: {
    padding: 10,
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#f8edf8",
    width: "100%",
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
});

