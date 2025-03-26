import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, Modal, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from 'expo-router';
import {SignUp} from '@/authentication/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [formattedDate, setFormattedDate] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !email || !confirmEmail || !phone || !lastName || !formattedDate || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (email !== confirmEmail) {
      Alert.alert('Error', 'Emails do not match');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    console.log(phone)
    const formattedPhone = "+44" + phone.toString()

    console.log("pineapples")

    try {
       await SignUp(email, password, email, firstName, lastName, formattedPhone, formattedDate.toString())
       await AsyncStorage.setItem("email", email);
       console.log("oranges")
       setIsRegistered(true);

    } catch (error: any) {
      console.error("Caught Signup Error:", error); // Debugging log

      const errorMessage = String(error);

      if (errorMessage.includes("UsernameExistsException:")) {
        Alert.alert("Signup Failed", "User already exists. Please try again.");
      } else if (errorMessage.includes("InvalidPasswordException")) {
        Alert.alert("Signup Failed", "Password did not conform with policy.");
      } else {
        Alert.alert("Error", errorMessage);
      }
    }

  };

  useEffect(() => {
    if (isRegistered) {
      router.replace('/confirmEmail');
    }
  }, [isRegistered]);

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
      <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
              <Text style={styles.title}>BathLink</Text>
              <Text style={styles.subtitle}>Register</Text>

              <TextInput style={styles.inputContainer} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
              <TextInput style={[styles.input, { width: "80%" }]} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
              <TextInput style={[styles.input, { width: "80%" }]} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
              <TextInput style={[styles.input, { width: "80%" }]} placeholder="Confirm Email" value={confirmEmail} onChangeText={setConfirmEmail} keyboardType="email-address" />
              <TextInput
                  style={[styles.input, { width: "80%" }]}
                  placeholder="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  returnKeyType="done" // Allows keyboard to be dismissed easily
              />

              {/* Date of Birth Input */}
              <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.inputContainer}>
                <Text style={formattedDate ? styles.inputText : styles.placeholderText}>
                  {formattedDate || "Date of Birth"}
                </Text>
                <MaterialIcons name="calendar-today" size={24} color="black" />
              </TouchableOpacity>

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

              <TextInput style={[styles.input, { width: "80%" }]} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
              <TextInput style={[styles.input, { width: "80%" }]} placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

              <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/login')}>
                <MaterialIcons name="arrow-back" size={24} color="black" />
                <Text style={styles.backButton}></Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f4ff' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#000' },
  subtitle: { fontSize: 18, marginBottom: 20 },
  input: { width: '80%', padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 5, backgroundColor: '#fff' },
  button: { backgroundColor: '#6c5b7b', padding: 10, borderRadius: 5, marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },

    scrollContainer: {

      backgroundColor: '#f8f4ff',
      width: "100%",
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center', // Ensures inputs stay centered
      paddingVertical: 20, // Prevents inputs from getting too close to the screen edges
    },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    padding: 10,
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

 backButton: {
   position: "absolute",
   top: 10, // Adjust for proper placement
   left: 10, // Moves it to the left side
   padding: 10,
 },
});

