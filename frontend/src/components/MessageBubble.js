import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function MessageBubble({ text, from }) {
  const isUser = from === 'user';

  // Ensure text is always a string
  const displayText = typeof text === 'string' ? text : String(text || '');

  return (
    isUser ? (
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <View style={[styles.message, styles.user]}>
          <Text style={[styles.text, styles.userText]}>{displayText}</Text>
        </View>
      </View>
    ) : (
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        <Image
          source={require('../fotos/tripi 3.0.png')}
          style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
          resizeMode="cover"
        />
        <View style={[styles.message, styles.bot]}>
          <Text style={styles.text}>{displayText}</Text>
        </View>
      </View>
    )
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
