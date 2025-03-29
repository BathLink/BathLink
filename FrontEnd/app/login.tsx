import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal} from 'react-native';
import {useRouter} from "expo-router";
import {manualLogin} from '@/authentication/manualLogin';
import {getCurrentUser} from 'aws-amplify/auth';
import {getForgotCode, confirmForgotCode} from '@/authentication/forgotPass';

export default function LoginScreen() {

    const [id, setID] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const [showCodeModal, setShowCodeModal] = useState(false);
    const router = useRouter();

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
        if (!id || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            await manualLogin(id, password); // Call login function

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

    return (
        <View style={styles.container}>
            <Text style={styles.title}>BathLink</Text>
            <Text style={styles.subtitle}>Log in</Text>
            <TextInput style={styles.input} placeholder="Username/Email" value={id} onChangeText={setID}/>
            <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password}
                       onChangeText={setPassword}/>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace('/register')}>
                <Text style={styles.switchText}>Register Now</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.switchText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Forgot Password Modal (Email Entry) */}
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
                        <TouchableOpacity style={styles.modalButton} onPress={getCode}>
                            <Text style={styles.modalButtonText}>Send Reset Code</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowForgotPasswordModal(false)}>
                            <Text style={styles.closeModalText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Confirmation Code Modal (Code Entry) */}
            <Modal visible={showCodeModal} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enter Confirmation Code</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter the code sent to your email"
                            placeholderTextColor="#888"
                            value={code}
                            onChangeText={setCode}
                        />
                        <TouchableOpacity style={styles.modalButton} onPress={resetPassword}>
                            <Text style={styles.modalButtonText}>Reset Password</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowCodeModal(false)}>
                            <Text style={styles.closeModalText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f4ff'},
    title: {fontSize: 32, fontWeight: 'bold', color: '#000'},
    subtitle: {fontSize: 18, marginBottom: 20},
    input: {width: '80%', padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 5, backgroundColor: '#fff'},
    button: {backgroundColor: '#6c5b7b', padding: 10, borderRadius: 5, marginTop: 10},
    buttonText: {color: '#fff', fontWeight: 'bold'},
    switchText: {marginTop: 10, color: '#6c5b7b'},

    modalContainer: {flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)"},
    modalContent: {backgroundColor: "#fff", padding: 20, borderRadius: 10, alignItems: "center", width: "80%"},
    modalTitle: {fontSize: 20, fontWeight: "bold", marginBottom: 15},
    modalButton: {
        backgroundColor: "#6c5b7b",
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        width: "100%",
        alignItems: "center"
    },
    modalButtonText: {color: "#fff", fontWeight: "bold"},
    closeModalText: {marginTop: 10, color: "#6c5b7b"},
});
