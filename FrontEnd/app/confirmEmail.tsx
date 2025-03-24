import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from 'expo-router';
import {ConfirmEmailAddy} from '@/authentication/confirm';

export default function ConfirmScreen() {

  const email = "finnahawkins@gmail.com"
  const [code, setCode] = useState('');
  const router = useRouter();

  const confirm = async () => {
    if (!code) {
      Alert.alert('Error', 'Please fill in the field');
      return;
    }
    console.log("dogs")
    await ConfirmEmailAddy(email, code)
    console.log("cats")
    router.replace('/(tabs)/meetups');
  };

    return (
      <View style={styles.container}>
        <Text style={styles.title}>BathLink</Text>
        <Text style={styles.subtitle}>Confirm Email</Text>
        <TextInput style={styles.input} placeholder="Enter Code" value={code} onChangeText={setCode} />



      <TouchableOpacity style={styles.button} onPress={confirm}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
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
});