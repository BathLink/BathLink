import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, Modal, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from 'expo-router';
import { SignUp } from '@/authentication/auth';
import {ThemedText} from "@/components/ThemedText";
import colours from './colours';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useColorScheme();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (isRegistered) {
      router.replace('/confirmEmail');
    }
  }, [isRegistered]);

  const handleRegister = async () => {
    if (!firstName || !email || !confirmEmail || !phone || !lastName || !formattedDate || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.toLowerCase().endsWith("@bath.ac.uk") || !confirmEmail.toLowerCase().endsWith("@bath.ac.uk")) {
      Alert.alert('Error', 'Email must be a Uni of Bath email');
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

    const formattedPhone = "+44" + phone.toString();

    try {
      await SignUp(email, password, email, firstName, lastName, formattedPhone, formattedDate);
      await AsyncStorage.setItem("email", email);
      setIsRegistered(true);
    } catch (error: any) {
      console.error("Caught Signup Error:", error);
      const errorMessage = String(error);
      if (errorMessage.includes("UsernameExistsException:")) {
        Alert.alert("Signup Failed", "User already exists. Please try again.");
      } else if (errorMessage.includes("InvalidPasswordException: Password did not conform with policy: Password not long enough")) {
        Alert.alert("Signup Failed", "Password did not conform with policy: Password not long enough");
      } else if (errorMessage.includes("InvalidPasswordException: Password did not conform with policy: Password must have uppercase characters")) {
        Alert.alert("Signup Failed", "Password did not conform with policy: Password must have uppercase characters");
      } else if (errorMessage.includes("InvalidPasswordException: Password did not conform with policy: Password must have numeric characters")) {
        Alert.alert("Signup Failed", "Password did not conform with policy: Password must have numeric characters");
      } else {
        Alert.alert("Error", errorMessage);
      }
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
    if (Platform.OS === "android") {
      setFormattedDate(formatDate(selectedDate || date)); // Set date immediately on Android
      setShowPicker(false);
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

  const testBtn = () => {
    console.log('Button pressed');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: colours[theme].background }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.titleContainer}>
            <MaterialIcons.Button name="arrow-back" size={28} color= {colours[theme].text} backgroundColor="transparent" onPress={() => router.replace('/login')}/>
            <Text 
        style={[styles.header,{
          color: colours[theme].text, 
          backgroundColor: "rgba(0,0,0,0)",
        }]} 
        >
          BathLink
        </Text>
            <MaterialIcons.Button name="notifications" size={28} color={"transparent"}
                                  backgroundColor="transparent" onPress={testBtn}/>

          </View>
          <Text style={[styles.subtitle, { color: colours[theme].text }]}>Register</Text>


          <View style={styles.container}>

            <TextInput style={[styles.input, { color: colours[theme].text, borderColor: colours[theme].text }]} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
            <TextInput style={[styles.input, { color: colours[theme].text, borderColor: colours[theme].text }]} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
            <TextInput style={[styles.input, { color: colours[theme].text, borderColor: colours[theme].text }]} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <TextInput style={[styles.input, { color: colours[theme].text, borderColor: colours[theme].text }]} placeholder="Confirm Email" value={confirmEmail} onChangeText={setConfirmEmail} keyboardType="email-address" />
            <TextInput style={[styles.input, { color: colours[theme].text, borderColor: colours[theme].text }]} placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" returnKeyType="done" />

            {/* Date Picker Trigger */}
            <TouchableOpacity onPress={() => setShowPicker(true)} style={[styles.inputContainer, { borderColor: colours[theme].text }]}>
              <Text style={[formattedDate ? { color: colours[theme].text } : { color: "grey" }]}>
                {formattedDate || "Date of Birth"}
              </Text>
              <MaterialIcons name="calendar-today" size={24} color={colours[theme].text} />
            </TouchableOpacity>

            {/* Android Date Picker (shows inline) */}
            {showPicker && Platform.OS === "android" && (
              <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} />
            )}

            {/* iOS Date Picker (inside Modal) */}
            {showPicker && Platform.OS === "ios" && (
              <Modal transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                  <View style={[styles.modalContent, {backgroundColor: colours[theme].background, borderColor:colours[theme].text, borderWidth: 0.5}]}>
                    <DateTimePicker value={date} mode="date" display="spinner" onChange={handleDateChange} />
                    <TouchableOpacity style={[styles.confirmButton, {backgroundColor: colours[theme].secondary}]} onPress={confirmDateSelection}>
                      <Text style={[styles.buttonText, {color: colours[theme].text}]}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}

            <TextInput style={[styles.input, { color: colours[theme].text, borderColor: colours[theme].text }]} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
            <TextInput style={[styles.input, { color: colours[theme].text, borderColor: colours[theme].text }]} placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

            <TouchableOpacity style={[styles.button, {backgroundColor: colours[theme].secondary}]} onPress={handleRegister}>
              <Text style={[styles.buttonText, {color: colours[theme].text}]}>Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  container: { flex: 1, justifyContent: "flex-start", alignItems: 'center',  width: "100%", paddingVertical: 16, },
  subtitle: { fontSize: 18, marginBottom: 10 },
  input: { width: '80%', padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 5},
  button: {padding: 10, borderRadius: 5, marginTop: 10 },
  buttonText: { fontWeight: 'bold' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20, width: "100%" },
  inputContainer: { flexDirection: "row", alignItems: "center", width: "80%", padding: 10, borderWidth: 1, borderRadius: 5, marginBottom: 10, justifyContent: "space-between" },
  inputText: { fontSize: 16 },
  placeholderText: { fontSize: 14 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContent: {  padding: 20, borderRadius: 10, alignItems: "center", width: "80%" },
  confirmButton: { marginTop: 10, padding: 10, borderRadius: 5, alignItems: "center", width: "80%" },
  backButton: { position: "absolute", top: 10, left: 10, padding: 10 },
  titleContainer: {
    flexDirection: 'row',
    flexGrow: 0,
    width: "100%",
    marginTop: 52,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
});
