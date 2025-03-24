import { Stack } from 'expo-router';
import { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function RootLayout() {
  const router = useRouter();




  return (
    <Stack initialRouteName="(tabs)">
      <Stack.Screen name="(tabs)" options={{ headerShown: false}} />
      <Stack.Screen name="profile" options={{ title: 'Edit Profile', headerBackTitle: "", headerBackTitleVisible: false}} />
      <Stack.Screen name="+not-found" options={{ title: "" }}/>

    </Stack>
  );
}
const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#8A2BE2", // Use your app's color theme
  },
  splashText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
});