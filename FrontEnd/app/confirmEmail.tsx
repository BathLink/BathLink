import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ConfirmEmailAddy } from '@/authentication/confirm';
import colours from './colours';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ConfirmScreen() {
  const theme = useColorScheme();

  const [code, setCode] = useState('');
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    (async () => {
      const email : any = await AsyncStorage.getItem("email");
      setEmail(email);
    })();
  }, []);

  const confirm = async () => {
    if (!code) {
      Alert.alert('Error', 'Please fill in the field');
      return;
    }
    await ConfirmEmailAddy(email, code)
    router.replace('/(tabs)/meetups');
  };

    return (
      <View style={[styles.container, {backgroundColor: colours[theme].background}]}>
        <Text style={[styles.title, {color: colours[theme].text}]}>BathLink</Text>
        <Text style={[styles.subtitle, {color: colours[theme].text}]}>Confirm Email</Text>
        <TextInput style={[styles.input, {color: colours[theme].text, borderColor: colours[theme].text}]} placeholder="Enter Code" value={code} onChangeText={setCode} />
        <TouchableOpacity style={[styles.button, {backgroundColor: colours[theme].secondary}]} onPress={confirm}>
          <Text style={[styles.buttonText, {color: colours[theme].text}]}>Register</Text>
        </TouchableOpacity>
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center'},
  title: { fontSize: 32, fontWeight: 'bold'},
  subtitle: { fontSize: 18, marginBottom: 20 },
  input: { width: '80%', padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 5},
  button: { padding: 10, borderRadius: 5, marginTop: 10 },
  buttonText: { fontWeight: 'bold' },
});