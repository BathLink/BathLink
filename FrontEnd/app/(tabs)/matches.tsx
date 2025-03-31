import {
    View, Text, Modal, StyleSheet, Pressable, ScrollView,
    TouchableHighlight, TouchableOpacity, Switch, Alert
} from 'react-native';
import {useState, useEffect} from 'react';
import {useRouter} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getCurrentUser} from 'aws-amplify/auth';
import {getInfo} from '@/authentication/getInfo';
import {putItem} from '@/authentication/putInfo';
import {deleteItem} from '@/authentication/deleteInfo';
import {postItem} from '@/authentication/postInfo';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {useColorScheme} from '@/hooks/useColorScheme';
import colours from '../colours';

export default function MatchesScreen() {
    const theme = useColorScheme();
    const [selectedTab, setSelectedTab] = useState('Invitations');
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [allMatches, setAllMatches] = useState([]);
    const [activityPreferences, setActivityPreferences] = useState([]);
    const router = useRouter();
    const [activityNames, setActivityNames] = useState<string[]>([]);
    const [toggles, setToggles] = useState<{ [key: string]: boolean }>({});
    const [preferences, setPreferences] = useState({});
    const [activities, setActivities] = useState<any[]>([]);
    //const [dbMeetups, setDbMeetups] = useState<any[]>([]);


    async function getMatches() {
        try {
            const { userId } = await getCurrentUser();
            const dbMeetups = await getInfo(`users/${userId}/meetups`);
            return dbMeetups;
        } catch (error) {
            console.error("Error fetching matches:", error);
            return { matches: [] }; // Ensure it returns a default structure to prevent errors
        }
    }


    const toggleSwitch = async (activityId: string) => {
        try {
            const {userId} = await getCurrentUser();
            const userPreferences: any = await getInfo(`users/${userId}/preferences`);
            let currentActivities = userPreferences.activities || [];

            let updatedActivities;
            if (currentActivities.includes(activityId)) {
                // Toggle OFF: Remove activityId
                updatedActivities = currentActivities.filter(id => id !== activityId);
            } else {
                // Toggle ON: Add activityId
                updatedActivities = [...currentActivities, activityId];
            }

            // Update backend
            const activities: any = {}
            activities[activityId] = !currentActivities.includes(activityId);
            console.log("Activities:", activities);
            const response  = await putItem(`users/${userId}/preferences`, activities);
            Alert.alert("Success", "Profile saved!");

            const updatedPreferences: any = await getInfo(`users/${userId}/preferences`);
            console.log("Updated Preferences:", updatedPreferences);

            // Update UI state correctly
            setToggles(prev => ({
                ...prev,
                [activityId]: !prev[activityId] // Correctly toggles individual switches
            }));

        } catch (error) {
            console.error("Error updating preference:", error);
        }
    };

    useEffect(() => {
        const checkPref = async() => {
            const check: any = await getInfo(`users/${userId}/preferences`);
            console.log(check);
        };
        checkPref();
    }, []);
    useEffect(() => {
        const loadActivityList = async () => {
            try {
                const activityResponse: any = await getInfo("/activities");
                console.log("Activity Response:", activityResponse);

                const { userId } = await getCurrentUser();
                const userPreferences: any = await getInfo(`users/${userId}/preferences`);
                const userActivityIds = userPreferences.activities || [];

                const seenActivities = new Set();
                const duplicates = [];

                activityResponse.forEach(activity => {
                    const key = `${activity.activity_name}-${activity.ability}-${activity.number_of_people}`;

                    if (seenActivities.has(key)) {
                        duplicates.push(activity);
                    } else {
                        seenActivities.add(key);
                    }
                });

// Log duplicates
                if (duplicates.length > 0) {
                    console.log("Duplicate Activities Found:", duplicates);
                } else {
                    console.log("No duplicates found.");
                }


                if (Array.isArray(activityResponse)) {
                    // Define ability sorting order
                    const abilityOrder: { [key: string]: number } = {
                        beginner: 1,
                        intermediate: 2,
                        advanced: 3
                    };

                    // Sort activities based on multiple criteria
                    const sortedActivities = [...activityResponse].sort((a, b) => {
                        // 1. Sort by activity_name (A → Z)
                        const nameComparison = a.activity_name.localeCompare(b.activity_name);
                        if (nameComparison !== 0) return nameComparison;

                        // 2. Sort by ability order (Beginner → Intermediate → Advanced)
                        const abilityA = abilityOrder[a.ability?.toLowerCase()] || 4; // Default to last place if missing
                        const abilityB = abilityOrder[b.ability?.toLowerCase()] || 4;
                        if (abilityA !== abilityB) return abilityA - abilityB;

                        // 3. Sort by number_of_people (small → large)
                        return (a.number_of_people || 0) - (b.number_of_people || 0);
                    });

                    setActivities(sortedActivities); // Store sorted activities in state

                    // Initialize toggles based on user preferences
                    const initialToggles: { [key: string]: boolean } = {};
                    sortedActivities.forEach(activity => {
                        initialToggles[activity["activity-id"]] = userActivityIds.includes(activity["activity-id"]);
                    });

                    setToggles(initialToggles);
                } else {
                    console.error("Invalid API response format:", activityResponse);
                }
            } catch (error) {
                console.error("Error fetching preferences:", error);
            }
        };



        loadActivityList();
    }, []);

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
            .replace(',', '') // Remove the default comma
            .replace(/(\d{1,2}) /, (match, p1) => `${p1}th `); // Add "th" to the day
    }

    async function getName(ids: string | any[]) {
        try {
            let names: string | [] = []
            for (let i = 0; i < ids.length; i++) {
                let userDetails = await getInfo(`users/${ids[i]}`)
                names.push(userDetails.name)
            }
            return names

        } catch (error) {
            console.error("Error fetching matches:", error);
            return []
        }
    }

    async function processMatches(dbMeetups) {
        try {
            let meetups = await dbMeetups.meetups.filter(meetup => !meetup.confirmed)
            let formatedMeetups = []
            for (let i = 0; i < meetups.length; i++) {
                let meetup = meetups[i]
                console.log(meetups)
                let id = meetup["meetup-id"]
                let title = meetup.activity
                let people = (await getName(meetup.participants))
                let date = formatMeetupDate(meetup.time_slot)
                let noPplAccepted = meetup.confirmed_users.length.toString()
                formatedMeetups.push([id, title, people, date, noPplAccepted])
            }
            return formatedMeetups

        }
        catch (e) {
            console.log(e)
            return []
        }

    }

    async function acceptMeetup(meetupId) {
        try {
            const { userId } = await getCurrentUser();
            await putItem(`meetups/${meetupId}`, `{userId: ${userId}}`);
        } catch (error) {
            console.error("Error fetching matches:", error);
            return { matches: [] }; // Ensure it returns a default structure to prevent errors
        }
    }

    async function declineMeetup(meetupId) {
        try {
            const { userId } = await getCurrentUser();
            await deleteItem(`meetups/${meetupId}`, `{userId: ${userId}}`);
        } catch (error) {
            console.error("Error fetching matches:", error);
            return { matches: [] }; // Ensure it returns a default structure to prevent errors
        }
    }
    useEffect(() => {
        const fetchMeetups = async () => {
            try {
                const meetupsData = await getMatches();
                const processedMatches = await processMatches(meetupsData);
                setAllMatches(processedMatches);
            } catch (error) {
                console.error("Error processing meetups:", error);
            }
        };

        fetchMeetups();

    }, []);

    const profileBtn = async () => {
        await AsyncStorage.setItem("page", "/matches");
        router.replace('/profile');
    };

    return (
        <View style={{flex: 1, backgroundColor: colours[theme].background}}>
            {/* Top Menu App Bar */}
            <View style={styles.titleContainer}>
                <MaterialIcons.Button
                    name="person" size={28} color={colours[theme].text}
                    backgroundColor="transparent" onPress={profileBtn}
                />
                <Text style={[styles.header, {color: colours[theme].text}]}>
                    BathLink
                </Text>
                <MaterialIcons.Button
                    name="notifications" size={28} color="transparent"
                    backgroundColor="transparent"
                />
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                {['Invitations', 'Preferences'].map(tab => (
                    <TouchableOpacity key={tab} onPress={() => setSelectedTab(tab)}>
                        <Text style={[
                            styles.tabText, selectedTab === tab && styles.tabTextSelected
                        ]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Invitations Tab */}
            {selectedTab === 'Invitations' && (
                <ScrollView style={styles.matchList}>
                    {allMatches.map((match, index) => (
                        <Pressable key={index} onPress={() => setSelectedMatch(match)}>
                            <View style={[styles.matchCard, {backgroundColor: colours[theme].secondary}]}>
                                <Text style={[styles.matchTitle, {color: colours[theme].text}]}>{match[1]}</Text>
                                <Text style={[styles.matchDetail, {color: colours[theme].text}]}>
                                    With {match[2].join(", ")}
                                </Text>
                                <Text style={[styles.matchDetail, {color: colours[theme].text}]}>{match[3]}</Text>
                                <View style={styles.buttonRow}>
                                    <TouchableHighlight
                                        underlayColor="#ddd"
                                        style={styles.iconContainer}
                                        onPress={() => acceptMeetup(match[0])}
                                    >
                                        <MaterialIcons name="check-circle" size={30} color={colours[theme].primary}/>
                                    </TouchableHighlight>
                                    <TouchableHighlight
                                        underlayColor="#ddd"
                                        style={styles.iconContainer}
                                        onPress={() => declineMeetup(match[0])}
                                    >
                                        <MaterialIcons name="cancel" size={30} color={colours[theme].primary}/>
                                    </TouchableHighlight>
                                </View>
                            </View>
                        </Pressable>
                    ))}
                </ScrollView>
            )}

            {/* Preferences Tab */}
            {selectedTab === 'Preferences' && (
                <ScrollView style={styles.matchList}>
                    {activities.map((activity) => (
                        <View key={activity["activity-id"]} style={styles.preferenceItem}>
                            <Text>{`${activity.activity_name} (${activity.ability}, ${activity.number_of_people} people)`}</Text>
                            <Switch
                                value={toggles[activity["activity-id"]] || false}
                                onValueChange={() => toggleSwitch(activity["activity-id"])}
                            />
                        </View>
                    ))}
                </ScrollView>
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
        paddingHorizontal: 20
    },
    header: {fontSize: 30, fontWeight: 'bold', marginVertical: 10, paddingHorizontal: 20},
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    tabText: {fontSize: 16, color: '#777'},
    tabTextSelected: {
        color: '#000',
        fontWeight: 'bold',
        borderBottomWidth: 2,
        borderBottomColor: '#000',
        paddingBottom: 4
    },
    matchList: {paddingHorizontal: 16},
    matchCard: {backgroundColor: '#f5f5fa', padding: 16, borderRadius: 12, marginVertical: 8},
    matchTitle: {fontSize: 16, fontWeight: 'bold', marginBottom: 4},
    matchDetail: {fontSize: 14, color: '#333'},
    buttonRow: {flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 16},
    iconContainer: {borderRadius: 20, padding: 4},
    preferenceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
});
