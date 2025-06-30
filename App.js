import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import ChatBot from './src/chat.tsx'; // Importa el componente ChatBot

export default function App() {
  return (
    <View style={styles.container}>
      <ChatBot /> {/* Muestra el chat en tu app */}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
