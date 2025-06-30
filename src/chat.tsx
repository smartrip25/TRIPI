import React, { useState } from 'react';
import { View, TextInput, Button, Text, ScrollView, StyleSheet } from 'react-native';
import { askGPT } from './gpt.ts'; // Importa la función de OpenAI

export default function ChatBot() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  // Función para enviar mensaje y obtener respuesta de OpenAI
  const sendMessage = async () => {
    if (!input) return;

    const updatedMessages = [...messages, `Tú: ${input}`];

    // Llamada a OpenAI para obtener respuesta
    const respuesta = await askGPT(input);

    setMessages([...updatedMessages, `Bot: ${respuesta}`]);
    setInput(''); // Limpiar campo de entrada
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg, i) => (
          <Text key={i} style={styles.messageText}>{msg}</Text>
        ))}
      </ScrollView>

      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Escribe algo"
        style={styles.input}
      />

      <Button title="Enviar" onPress={sendMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
    backgroundColor: '#fff',
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 10,
  },
  messageText: {
    marginVertical: 5,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});
