import { useState } from 'react';
import {
  View, StyleSheet, Switch, TouchableOpacity, Text,
  Modal, TextInput, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from "expo-router";
import * as Crypto from 'expo-crypto';
import {signOut, updatePassword, getCurrentUser} from 'aws-amplify/auth';
import { ThemedText } from '@/components/ThemedText';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  let primary_color = colorScheme === 'dark' ? "white" : "black";
  let background_color = "rgba(0, 0, 0, 0)";
  const router = useRouter();

  // State for toggle switches
  const [switch1, setSwitch1] = useState(false);
  const [switch2, setSwitch2] = useState(false);
  const [switch3, setSwitch3] = useState(false);
  const [switch4, setSwitch4] = useState(false);
  const [switch5, setSwitch5] = useState(false);
  const [switch6, setSwitch6] = useState(false);

  // State for modal and password fields
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  /** LOGOUT: Prevents auto-login but keeps credentials */
  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  /** PASSWORD CHANGE FUNCTION */
const handleChangePassword = async () => {

    try {
        const {username, userId, signInDetails} = await getCurrentUser();
    await updatePassword({oldPassword : currentPassword, newPassword : newPassword})
        Alert.alert("Success", "Password changed successfully!");
        setModalVisible(false);

    }
    catch(e){
        console.log(e)
        }
  }

  const profileBtn = async () => {
      await AsyncStorage.setItem("page", "/settings");
      router.replace('/profile')
  };





  return (
    <View style={[styles.container, { backgroundColor: background_color }]}>
      {/* Top Header Bar */}
      <View style={styles.titleContainer}>
        <MaterialIcons.Button
          name="person" size={28} color={primary_color} backgroundColor="transparent"
          onPress={profileBtn}
        />
          <ThemedText type="title" >BathLink</ThemedText>
        <MaterialIcons.Button
          name="notifications" size={28} color="transparent" backgroundColor="transparent"
        />
      </View>


     {/* Subheader: Settings */}
      <Text style={[styles.subheader, { color: primary_color }]}>Settings</Text>

      {/* Settings Options with Independent Switches */}
      <View style={styles.settingOption}>
        <Text style={[styles.optionText, { color: primary_color }]}>Setting 1</Text>
        <Switch value={switch1} onValueChange={setSwitch1} />
      </View>
      <View style={styles.settingOption}>
        <Text style={[styles.optionText, { color: primary_color }]}>Setting 2</Text>
        <Switch value={switch2} onValueChange={setSwitch2} />
      </View>
      <View style={styles.settingOption}>
        <Text style={[styles.optionText, { color: primary_color }]}>Setting 3</Text>
        <Switch value={switch3} onValueChange={setSwitch3} />
      </View>
      <View style={styles.settingOption}>
        <Text style={[styles.optionText, { color: primary_color }]}>Setting 4</Text>
        <Switch value={switch4} onValueChange={setSwitch4} />
      </View>
      <View style={styles.settingOption}>
        <Text style={[styles.optionText, { color: primary_color }]}>Setting 5</Text>
        <Switch value={switch5} onValueChange={setSwitch5} />
      </View>
      <View style={styles.settingOption}>
        <Text style={[styles.optionText, { color: primary_color }]}>Setting 6</Text>
        <Switch value={switch6} onValueChange={setSwitch6} />
      </View>


      {/* Change Password */}
      <TouchableOpacity style={styles.settingOption} onPress={() => setModalVisible(true)}>
        <Text style={[styles.optionText, { color: primary_color }]}>Change Password</Text>
        <MaterialIcons name="lock" size={24} color="gray" />
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={styles.settingOption} onPress={handleLogout}>
        <Text style={[styles.optionText, { color: "red" }]}>Log Out</Text>
        <MaterialIcons name="logout" size={24} color="red" />
      </TouchableOpacity>

      {/* PASSWORD CHANGE MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Current Password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              secureTextEntry
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleChangePassword}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

/** STYLES */
const styles = StyleSheet.create({
  container: { flex: 1 },
  titleContainer: {
    flexDirection: 'row',
    marginTop: 52,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  titleText: { fontSize: 28, fontWeight: 'bold' },
  subheader: { fontSize: 25, fontWeight: 'bold', marginVertical: 10, paddingHorizontal: 20 },
  settingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingHorizontal: 20,
  },
  optionText: { fontSize: 18 },

  /** MODAL STYLES */
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#6c5b7b',
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: { backgroundColor: 'gray' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

