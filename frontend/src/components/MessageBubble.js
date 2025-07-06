import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MessageBubble({ text, from }) {
  const isUser = from === 'user';

  return (
    <View style={[styles.message, isUser ? styles.user : styles.bot]}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  message: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  user: {
    backgroundColor: '#d1e7dd',
    alignSelf: 'flex-end',
  },
  bot: {
    backgroundColor: '#f8d7da',
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 16,
  },
});
