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
import colours from './colours';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ProfileScreen() {

    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [pronouns, setPronouns] = useState("");
    const [socialLink, setSocialLink] = useState("");
    const router = useRouter();
    const theme = useColorScheme();

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
            style={{flex: 1, backgroundColor: colours[theme].background}}
        >
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.titleContainer}>
                        <MaterialIcons.Button name="arrow-back" size={28} color= {colours[theme].text} backgroundColor="transparent"
                                              onPress={returnBtn}/>
                        <ThemedText type="title" color= {colours[theme].text}>My Profile</ThemedText>
                        <MaterialIcons.Button name="notifications" size={28} color={"transparent"}
                                              backgroundColor="transparent" onPress={testBtn}/>
                    </View>

                    <View style={styles.container}>
                        <View style={styles.profileImageContainer}>
                            <Image style={styles.profileImage}
                                   source={profileImage ? {uri: profileImage} : require("../assets/images/default-profile.png")}/>
                            <TouchableOpacity
                                style={[styles.editIcon, { backgroundColor: colours[theme].icon }]}
                                onPress={pickImage}
                            >
                                <MaterialIcons
                                    name="edit"
                                    size={24}
                                    color={colours[theme].iconText}
                                />
                            </TouchableOpacity>
                        </View>

                        <TextInput style={[styles.input, { color: colours[theme].text, borderColor: colours[theme].text }]} placeholder="Description"
                                   value={description} onChangeText={setDescription}/>

                        <TextInput style={[styles.input, { color: colours[theme].text, borderColor: colours[theme].text }]} placeholder="Pronouns"
                                   value={pronouns} onChangeText={setPronouns}/>

                        <TextInput style={[styles.input, { color: colours[theme].text, borderColor: colours[theme].text }]} placeholder="Link your social media"
                                   value={socialLink} onChangeText={setSocialLink}/>

                         <TouchableOpacity style={styles.button} onPress={saveProfile}>
                             <Text style = {[styles.buttonText, {color: colours[theme].text}]}>Save</Text>
                         </TouchableOpacity>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
const styles = StyleSheet.create({
  button: {  padding: 10, borderRadius: 5, marginTop: 10 },
  buttonText: { fontWeight: 'bold' },
  icon: { padding: 30 },
  backButton: { position: "absolute", top: 20, left: 10, padding: 10 },
  profileTitle: { fontSize: 24, fontWeight: "bold", marginTop: 10 },
  profileImageContainer: {position: "relative", width: 200, height: 200, marginBottom: 50 },
  profileImage: {width: 200, height: 200, borderRadius: 100 },

  scrollContainer: {
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
      paddingVertical: 30,
      paddingHorizontal: 20,
    },

    container: {
        width: "100%",
        flex: 0.5,
        justifyContent: "center",
        alignItems: "center",

    },

    input: {
        width: "80%",
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginBottom: 15,
    },

    editIcon: {
        position: "absolute",
        bottom: 10,  // Adjusted positioning
        right: 10,   // Adjusted positioning
        borderRadius: 25, // Circular shape
        padding: 8, // Padding to make it larger
        elevation: 5, // Shadow for better visibility
    },
});

