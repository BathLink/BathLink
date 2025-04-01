import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal} from 'react-native';
import {useRouter} from "expo-router";
import {manualLogin} from '@/authentication/manualLogin';
import {getCurrentUser} from 'aws-amplify/auth';
import {getForgotCode, confirmForgotCode} from '@/authentication/forgotPass';
import colours from './colours';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function LoginScreen() {

    const [id, setID] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const [showCodeModal, setShowCodeModal] = useState(false);
    const router = useRouter();
    const theme = useColorScheme();
    

    const handleForgotPassword = async () => {
        setShowForgotPasswordModal(true);
    };

    const getCode = async () => {
        try {
            await getForgotCode(email);
            setShowForgotPasswordModal(false);
            setShowCodeModal(true);

        } catch (e) {
            console.log(e);
            Alert.alert('Error', 'Failed to send reset code. Please try again.');
        }
    };

    const resetPassword = async () => {
        try {
            const newPassword = Math.random().toString(36).slice(-8);
            await confirmForgotCode(email, code, newPassword);
            Alert.alert("Password Reset", `Your new password is: ${newPassword}`);
            setShowCodeModal(false);

        } catch (e) {
            Alert.alert('Error', 'Failed to reset password. Please check the code and try again.');
        }
    };

    useEffect(() => {
        async function autoSign() {
            try {
                await getCurrentUser();
                router.replace('/(tabs)/meetups');

            } catch (e) {
                console.log(e)
            }
        }

        autoSign();


    }, []);


    const handleLogin = async () => {
        const idLower = id.toLowerCase();
        if (!idLower || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            await manualLogin(idLower, password); // Call login function

            router.replace('/(tabs)/meetups'); // Navigate only if successful

        } catch (error: any) {
            console.error("Caught Login Error:", error); // Debugging log

            const errorMessage = String(error);

            if (errorMessage.includes("NotAuthorizedException")) {
                Alert.alert("Login Failed", "Incorrect username or password. Please try again.");
            } else if (errorMessage.includes("UserNotFoundException")) {
                Alert.alert("Login Failed", "No user found. Please try again.");
            } else {
                Alert.alert("Error", errorMessage);
            }
        }
    };

    const registerPage = async () => {
        router.replace('/register');
    }

    return (
        <View style={[styles.container, {backgroundColor: colours[theme].background}]}>
            <Text style={[styles.title, { color: colours[theme].text }]}>BathLink</Text>
            <Text style={[styles.subtitle, { color: colours[theme].text }]}>Log in</Text>
            <TextInput style={[styles.input, { color: colours[theme].text, borderColor: colours[theme].text }]} placeholder="Username/Email" value={id} onChangeText={setID}/>
            <TextInput style={[styles.input, { color: colours[theme].text, borderColor: colours[theme].text }]} placeholder="Password" secureTextEntry value={password}
                       onChangeText={setPassword}/>
            <TouchableOpacity style={[styles.button, , {backgroundColor: colours[theme].secondary}]} onPress={handleLogin}>
                <Text style={[styles.buttonText, { color: colours[theme].text }]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={registerPage}>
                <Text style={[styles.switchText, { color: colours[theme].text }]}>Register Now</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={[styles.switchText, { color: colours[theme].text }]}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace('/confirmEmail')}>
                <Text style={[styles.switchText, { color: colours[theme].text }]}>Confirm Email</Text>
            </TouchableOpacity>

            {/* Forgot Password Modal (Email Entry) */}
            <Modal visible={showForgotPasswordModal} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, {backgroundColor: colours[theme].background, borderColor:colours[theme].text, borderWidth: 0.5}]}>
                        <Text style={[styles.modalTitle, {color: colours[theme].text}]}>Reset Password</Text>
                        <TextInput
                            style={[styles.input, {color: colours[theme].text, borderColor:colours[theme].text}]}
                            placeholder="Enter your email"
                            placeholderTextColor="#888"
                            value={email}
                            onChangeText={setEmail}
                        />
                        <TouchableOpacity style={[styles.modalButton, {backgroundColor: colours[theme].secondary}]} onPress={getCode}>
                            <Text style={[styles.modalButtonText, { color: colours[theme].text }]}>Send Reset Code</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowForgotPasswordModal(false)}>
                            <Text style={[styles.closeModalText, { color: colours[theme].text }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Confirmation Code Modal (Code Entry) */}
            <Modal visible={showCodeModal} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, {backgroundColor: colours[theme].background, borderColor:colours[theme].text, borderWidth: 0.5}]}>
                        <Text style={styles.modalTitle}>Enter Confirmation Code</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter the code sent to your email"
                            placeholderTextColor="#888"
                            value={code}
                            onChangeText={setCode}
                        />
                        <TouchableOpacity style={[styles.modalButton, {backgroundColor: colours[theme].secondary}]} onPress={resetPassword}>
                            <Text style={[styles.modalButtonText, { color: colours[theme].text }]}>Reset Password</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowCodeModal(false)}>
                            <Text style={[styles.closeModalText, { color: colours[theme].text }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    title: {fontSize: 32, fontWeight: 'bold', },
    subtitle: {fontSize: 18, marginBottom: 20},
    input: {width: '80%', padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 5},
    button: {padding: 10, borderRadius: 5, marginTop: 10},
    buttonText: { fontWeight: 'bold'},
    switchText: {marginTop: 10},

    modalContainer: {flex: 1, justifyContent: "center", alignItems: "center"},
    modalContent: {padding: 20, borderRadius: 10, alignItems: "center", width: "80%"},
    modalTitle: {fontSize: 20, fontWeight: "bold", marginBottom: 15},
    modalButton: {
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        width: "100%",
        alignItems: "center"
    },
    modalButtonText: {fontWeight: "bold"},
    closeModalText: {marginTop: 10},
});
