import {FlatList, View, StyleSheet, Text, Pressable, Modal, Image} from 'react-native';
import {useState, useEffect} from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {getInfo} from '@/authentication/getInfo';
import {getCurrentUser} from 'aws-amplify/auth';
import {useRouter} from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import colours from '../colours';
import {useColorScheme} from '@/hooks/useColorScheme';
import {downloadData} from "aws-amplify/storage";

export default function MeetupsScreen() {
    const [selectedMeetup, setSelectedMeetup] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedProfilePic, setSelectedProfilePic] = useState(null);
    const [allMeetups, setAllMeetups] = useState([]);
    const router = useRouter();
    const theme = useColorScheme();

    async function getMeetups() {
        try {
            const {userId} = await getCurrentUser();
            console.log("User ID:", userId);

            const dbMeetups = await getInfo(`users/${userId}/meetups`);
            return dbMeetups;
        } catch (error) {
            console.error("Error fetching meetups:", error);
            return {meetups: []};
        }
    }

    function formatMeetupDate(dateString) {
        const date = new Date(dateString);

        const options = {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };

        return new Intl.DateTimeFormat('en-GB', options).format(date)
            .replace(',', '')
            .replace(/(\d{1,2}) /, (match, p1) => `${p1}th `);
    }

    async function processMeetups(dbMeetups) {
        return Promise.all(dbMeetups.meetups
            .filter(meetup => meetup.confirmed)
            .map(async (meetup, index) => {
                let participantProfiles = []
                for(let i = 0; i < meetup.confirmed_users.length; i++) {
                    const profile = await getInfo(`users/${meetup.confirmed_users[i]}/profile`)
                    participantProfiles.push(profile)
                }
                console.log("Participant Profiles:", participantProfiles);

                return {
                    id: (index + 1).toString(),
                    title: meetup.activity,
                    description: formatMeetupDate(meetup.time_slot),
                    noPplAccepted: meetup.confirmed_users.length.toString(),
                    hostUserId: meetup.hostUserId,
                    participantProfiles: participantProfiles, // Now fully resolved
                };
            })
        );
    }



    useEffect(() => {
        const fetchMeetups = async () => {
            try {
                const meetupsData = await getMeetups();
                const processedMeetups = await processMeetups(meetupsData);
                setAllMeetups(processedMeetups);
            } catch (error) {
                console.error("Error processing meetups:", error);
            }
        };

        fetchMeetups();

        const intervalId = setInterval(fetchMeetups, 1000);

        // Clear the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, []);

    const blobToUri = (blob: any) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result); // Base64 URI
            reader.onerror = reject;
            reader.readAsDataURL(blob); // Convert blob to Base64 URI
        });
    };





    const selectMeetup = async (meetup) => {
        setSelectedMeetup(meetup);
    };

    const closeMeetup = () => {
        setSelectedMeetup(null);
        setSelectedUser(null);
    };

    const profileBtn = async () => {
        await AsyncStorage.setItem("page", "/meetups");
        router.replace('/profile');
    };

    const renderHeader = () => (
        <View style={{backgroundColor: colours[theme].background}}>
            {/* Top Menu App Bar */}
            <View style={styles.titleContainer}>
                <MaterialIcons.Button
                    name="person"
                    size={28}
                    color={colours[theme].text}
                    backgroundColor="transparent"
                    onPress={profileBtn}
                />
                <Text style={[styles.header, {color: colours[theme].text}]}>BathLink</Text>
                <MaterialIcons.Button
                    name="notifications"
                    size={28}
                    color="transparent"
                    backgroundColor="transparent"
                />
            </View>

            {/* Subheader */}
            <Text style={[styles.subheader, {color: colours[theme].text}]}>Meetups</Text>

            {allMeetups.length > 0 ? (
                <View>
                    <Text style={[styles.subsubheader, {color: colours[theme].text}]}>Next Meetup</Text>
                    <Pressable onPress={() => selectMeetup(allMeetups[0])}>
                        <View style={[styles.meetupBox, {backgroundColor: colours[theme].secondary}]}>
                            <Text
                                style={[styles.meetupTitle, {color: colours[theme].text}]}>{allMeetups[0].title}</Text>
                            <Text
                                style={[styles.meetupDescription, {color: colours[theme].text}]}>{allMeetups[0].description}</Text>
                        </View>
                    </Pressable>
                </View>
            ) : (
                <Text style={[styles.subsubheader, {color: colours[theme].text}]}>No Meetups Found</Text>
            )}
        </View>
    );
    console.log("selected",selectedMeetup)
    const renderItem = ({ item }) => (
        item.social?
        <Text style={[styles.expandedDetail, {color: colours[theme].text}]}>
            {item.social}
        </Text>:null
    );

    return (
        <View style={{flex: 1, backgroundColor: colours[theme].background}}>
            <FlatList
                data={allMeetups.slice(1)}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => (
                    <Pressable onPress={() => selectMeetup(item)}>
                        <View style={[styles.meetupBox, {backgroundColor: colours[theme].secondary}]}>
                            <Text style={[styles.meetupTitle, {color: colours[theme].text}]}>{item.title}</Text>
                            <Text
                                style={[styles.meetupDescription, {color: colours[theme].text}]}>{item.description}</Text>
                        </View>
                    </Pressable>
                )}
                ListHeaderComponent={renderHeader}
            />

            {/* Expanded Meetup Modal */}
            {selectedMeetup && (
                <Modal animationType="fade" transparent={true} visible={!!selectedMeetup}>
                    <Pressable style={styles.modalOverlay} onPress={closeMeetup}>
                        <View style={[styles.expandedMeetup, {backgroundColor: colours[theme].secondary}]}>
                            <Text style={[styles.expandedTitle, {color: colours[theme].text}]}>
                                {selectedMeetup.title}
                            </Text>
                            <Text style={[styles.expandedDetail, {color: colours[theme].text}]}>
                                📅 {selectedMeetup.description}
                            </Text>
                            <Text style={[styles.expandedDetail, {color: colours[theme].text}]}>
                                 {selectedMeetup.noPplAccepted} attendees
                            </Text>
                            <FlatList data={selectedMeetup.participantProfiles} renderItem={renderItem}/>




                            <Pressable onPress={closeMeetup} style={styles.closeButton}>
                                <Text style={[styles.closeButtonText, {color: colours[theme].text}]}>Close</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        marginTop: 52,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    header: {
        fontSize: 30,
        fontWeight: 'bold',
        marginVertical: 10,
        paddingHorizontal: 20,
    },
    subheader: {
        fontSize: 25,
        fontWeight: 'bold',
        marginVertical: 10,
        paddingHorizontal: 20,
    },
    subsubheader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
        paddingHorizontal: 20,
    },
    meetupBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginHorizontal: 20,
        marginVertical: 8,
        borderRadius: 10,
        borderWidth: 0,
        elevation: 1,
    },
    meetupTextContainer: {
        flex: 1,
        flexDirection: 'column',
        paddingRight: 10,
    },
    meetupTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    meetupDescription: {
        fontSize: 14,
    },
    meetupImage: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    expandedMeetup: {
        width: '85%',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
    },
    expandedTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    expandedDetail: {
        fontSize: 16,
        marginVertical: 5,
    },
    expandedImage: {
        marginVertical: 10,
    },
    closeButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    closeButtonText: {
        fontSize: 16,
    },
    userProfileContainer: {
        alignItems: "center",
        marginVertical: 10,
    },

    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,  // Make it circular
        marginBottom: 10,
    },

    userName: {
        fontSize: 18,
        fontWeight: "bold",
    },

    userDescription: {
        fontSize: 14,
        textAlign: "center",
        marginTop: 5,
    },

});

