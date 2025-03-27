import React, {useState, useEffect} from "react";
import {Text, View, TextInput, StyleSheet, Image, TouchableOpacity, Platform, Alert, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import {uploadData, downloadData} from 'aws-amplify/storage';
import {getCurrentUser} from 'aws-amplify/auth';
import {getInfo} from '@/authentication/getInfo';
import {postItem} from '@/authentication/postInfo';
import '@/authentication/aws-exports'
import {useRouter} from 'expo-router';
import {ThemedText} from "@/components/ThemedText";

export default function ProfileScreen() {

    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [pronouns, setPronouns] = useState("");
    const [socialLink, setSocialLink] = useState("");
    const router = useRouter();

    useEffect(() => {
        const loadProfileData = async () => {
            const {username, userId, signInDetails} = await getCurrentUser();
            const storedProfile: any = await getInfo("users/" + userId + "/profile");

            if (storedProfile) {
                setDescription(storedProfile.description);
                setPronouns(storedProfile.pronouns);
                setSocialLink(storedProfile.social);
            }
        };

        loadProfileData();
    }, []);

    const saveProfile = async () => {
        try {
            const profileData = {
                description: description,
                pronouns: pronouns,
                social: socialLink,
            };
            const {username, userId} = await getCurrentUser();
            const response = await postItem("users/" + userId + "/profile", profileData);
            Alert.alert("Success", "Profile saved!");

        } catch (e) {
            console.error("Error saving profile:", e);
            Alert.alert("Error", "Failed to save profile");
        }
    };


    const pickImage = async () => {
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Required", "Please allow access to upload a profile picture.");
            return;
        }
        const imageResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!imageResult.canceled) {
            setProfileImage(imageResult.assets[0].uri);
        }
        try {
            const {username, userId, signInDetails} = await getCurrentUser();
            const response = await fetch(imageResult.assets![0].uri)
            const blob = await response.blob()
            const result = await uploadData({
                path: userId + ".png",
                data: blob,
                options: {
                    bucket: {
                        bucketName: "bathlink-pfp",
                        region: 'eu-west-2',
                    }
                }
            }).result;
            console.log(result);

        } catch (e) {
            console.log(e)
        }
    };

    const blobToUri = (blob: any) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result); // Base64 URI
            reader.onerror = reject;
            reader.readAsDataURL(blob); // Convert blob to Base64 URI
        });
    };


    useEffect(() => {
        const downloadImage = async () => {
            try {
                const {username, userId, signInDetails} = await getCurrentUser();
                const result = await downloadData({
                    path: userId + ".png",
                    options: {
                        bucket: {
                            bucketName: "bathlink-pfp",
                            region: 'eu-west-2',
                        }
                    }
                }).result;
                const blob = await result.body.blob()
                const uri: any = await blobToUri(blob)
                setProfileImage(uri)

                console.log(result);
            } catch (e) {
                console.log(e)
            }

        };
        downloadImage();

    }, []);


    const returnBtn = async () => {
        const returnPage : any = "/(tabs)" + await AsyncStorage.getItem("page");
        router.replace(returnPage)
    };

    const testBtn = () => {
        console.log('Button pressed');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{flex: 1}}
        >
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.titleContainer}>
                        <MaterialIcons.Button name="arrow-back" size={28} color={"black"} backgroundColor="transparent"
                                              onPress={returnBtn}/>
                        <ThemedText type="title">My Profile</ThemedText>
                        <MaterialIcons.Button name="notifications" size={28} color={"transparent"}
                                              backgroundColor="transparent" onPress={testBtn}/>
                    </View>

                    <View style={styles.container}>
                        <View style={styles.profileImageContainer}>
                            <Image style={styles.profileImage}
                                   source={profileImage ? {uri: profileImage} : require("../assets/images/default-profile.png")}/>
                            <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
                                <MaterialIcons name="edit" size={20} color="black"/>
                            </TouchableOpacity>
                        </View>

                        <TextInput style={styles.input} placeholder="Description"
                                   value={description} onChangeText={setDescription}/>

                        <TextInput style={styles.input} placeholder="Pronouns"
                                   value={pronouns} onChangeText={setPronouns}/>

                        <TextInput style={styles.input} placeholder="Link your social Media"
                                   value={socialLink} onChangeText={setSocialLink}/>

                         <TouchableOpacity style={styles.button} onPress={saveProfile}>
                             <Text style={styles.buttonText}>Save</Text>
                         </TouchableOpacity>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
const styles = StyleSheet.create({
  button: { backgroundColor: '#6c5b7b', padding: 10, borderRadius: 5, marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  icon: { padding: 10 },
  backButton: { position: "absolute", top: 20, left: 10, padding: 10 },
  profileTitle: { fontSize: 24, fontWeight: "bold", marginTop: 10 },
  profileImageContainer: {position: "relative", width: 100, height: 100, marginBottom: 50 },
  profileImage: {width: 100, height: 100, borderRadius: 50, backgroundColor: "#e0e0e0" },

  scrollContainer: {
      backgroundColor: '#f8f4ff',
      width: "100%",
      flexGrow: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingVertical: 50,
    },

  titleContainer: {
      width: "100%",
      flexDirection: 'row',
      flexGrow: 0,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 20,
      paddingHorizontal: 20,
    },

    container: {
        width: "100%",
        flex: 0.5,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#f8f4ff'
    },

    input: {
        width: "80%",
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: "white",
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

