import  React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

const Home=()=>{
  return (
      <Text style={{
                    marginTop:300,
                    marginLeft:10}}>
          TEsT
      </Text>
  )
}


export default function App() {
  return (
    <View>
          <Home/>
    </View>
  );
}