import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import {useRouter} from "expo-router";


export default function LoginScreen({ navigation }) {


  const [id, setID] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState("");
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const router = useRouter();
    const handleForgotPassword = async () => {
      setShowForgotPasswordModal(true);
    };

const resetPassword = async () => {
  const storedUserData = await AsyncStorage.getItem("user");
  if (!storedUserData) {
    Alert.alert("Error", "No user found.");
    return;
  }

  const storedUser = JSON.parse(storedUserData);
  if (storedUser.email !== email) {
    Alert.alert("Error", "Email not found.");
    return;
  }

  // Generate a random 8-character password
  const newPassword = Math.random().toString(36).slice(-8);
  const hashedNewPassword = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    newPassword
  );

  storedUser.password = hashedNewPassword;
  await AsyncStorage.setItem("user", JSON.stringify(storedUser));

  Alert.alert("Password Reset", `Your new password is: ${newPassword}`);
  setShowForgotPasswordModal(false);
};



  useEffect(() => {

    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const storedUser = await AsyncStorage.getItem('isLoggedIn');


    if (storedUser.trim() === "true") {

      router.replace('/(tabs)/meetups');
    }
  };





  const handleLogin = async () => {
    if (!id || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const hashedPassword = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );

    const storedUser = JSON.parse(await AsyncStorage.getItem('user'));
    if (storedUser && (storedUser.username == id || storedUser.email == id) && storedUser.password === hashedPassword) {

      await AsyncStorage.setItem('isLoggedIn', 'true');
      router.replace('/(tabs)/meetups');
    } else {
      Alert.alert('Error', 'Invalid credentials');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BathLink</Text>
      <Text style={styles.subtitle}>Log in</Text>
      <TextInput style={styles.input} placeholder="Username/Email" value={id} onChangeText={setID} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace('/register')}>
        <Text style={styles.switchText}>Register Now</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={ handleForgotPassword}>
        <Text style={styles.switchText}>Forogt Password?</Text>
      </TouchableOpacity>

      {/* Forgot Password Modal */}
      <Modal visible={showForgotPasswordModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity style={styles.modalButton} onPress={resetPassword}>
              <Text style={styles.modalButtonText}>Reset Password</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowForgotPasswordModal(false)}>
              <Text style={styles.closeModalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f4ff' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#000' },
  subtitle: { fontSize: 18, marginBottom: 20 },
  input: { width: '80%', padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 5, backgroundColor: '#fff' },
  button: { backgroundColor: '#6c5b7b', padding: 10, borderRadius: 5, marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  switchText: { marginTop: 10, color: '#6c5b7b' },

  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, alignItems: "center", width: "80%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  modalButton: { backgroundColor: "#6c5b7b", padding: 10, borderRadius: 5, marginTop: 10, width: "100%", alignItems: "center" },
  modalButtonText: { color: "#fff", fontWeight: "bold" },
  closeModalText: { marginTop: 10, color: "#6c5b7b" },
});
