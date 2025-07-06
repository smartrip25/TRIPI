import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Picker,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MessageBubble from '../components/MessageBubble';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tool, setTool] = useState('default');

  const assistantName = 'Tripi';

  // Recuperar historial
  useEffect(() => {
    AsyncStorage.getItem('chatHistory').then((data) => {
      if (data) setMessages(JSON.parse(data));
    });
  }, []);

  // Guardar historial
  useEffect(() => {
    AsyncStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);
    setInput('');

    try {
      const res = await fetch('http://<TU_IP>:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, tool, model, temperature }),
      });
      const data = await res.json();

      const assistantMessage = {
        sender: 'assistant',
        text: data.response ?? 'No hubo respuesta.',
        tool,
        model,
        temperature,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: 'Error procesando la solicitud.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat con {assistantName}</Text>

      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageBubble text={item.text} from={item.sender} />}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.chat}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Escribí una pregunta..."
          style={styles.input}
        />
        <Button title={loading ? 'Pensando...' : 'Enviar'} onPress={handleSend} disabled={loading} />
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  controls: { marginBottom: 10 },
  picker: { height: 40, marginVertical: 5 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 8, marginRight: 10, borderRadius: 10 },
  chat: { paddingVertical: 10 },
});

export default ChatScreen;
