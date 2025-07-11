import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MessageBubble from '../components/MessageBubble';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('unknown');

  const assistantName = 'Tripi';

  // Test server connection
  useEffect(() => {
    testServerConnection();
  }, []);

  const testServerConnection = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/test');
      if (response.ok) {
        setServerStatus('connected');
      } else {
        setServerStatus('error');
      }
    } catch (error) {
      console.error('Server connection test failed:', error);
      setServerStatus('error');
    }
  };

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
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage = {
        sender: 'assistant',
        text: data.response ?? 'No hubo respuesta.',
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Network error:', error);
      setMessages((prev) => [
        ...prev,
        { 
          sender: 'assistant', 
          text: 'Error de conexión. Verifica que el servidor esté ejecutándose en http://localhost:3000' 
        },
      ]);
      Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor. Verifica que esté ejecutándose.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (serverStatus) {
      case 'connected': return '#28a745';
      case 'error': return '#dc3545';
      default: return '#ffc107';
    }
  };

  const getStatusText = () => {
    switch (serverStatus) {
      case 'connected': return 'Conectado';
      case 'error': return 'Error de conexión';
      default: return 'Verificando...';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat con {assistantName}</Text>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

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
          multiline={false}
        />
        <Button 
          title={loading ? 'Pensando...' : 'Enviar'} 
          onPress={handleSend} 
          disabled={loading || serverStatus !== 'connected'} 
        />
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 10,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold',
    flex: 1
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  controls: { marginBottom: 10 },
  picker: { height: 40, marginVertical: 5 },
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5,
  },
  input: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 8, 
    marginRight: 10, 
    borderRadius: 10,
    backgroundColor: 'white'
  },
  chat: { 
    paddingVertical: 10,
    flexGrow: 1
  },
});

export default ChatScreen;
