import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MessageBubble({ text, from }) {
  const isUser = from === 'user';

  // Ensure text is always a string
  const displayText = typeof text === 'string' ? text : String(text || '');

  return (
    <View style={[styles.message, isUser ? styles.user : styles.bot]}>
      <Text style={[styles.text, isUser && styles.userText]}>{displayText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  message: {
    padding: 12,
    borderRadius: 18,
    marginVertical: 6,
    marginHorizontal: 8,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  user: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bot: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  userText: {
    color: 'white',
  },
});
