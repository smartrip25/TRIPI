import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MessageBubble from '../components/MessageBubble';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('unknown');
  const [isNewChat, setIsNewChat] = useState(true);
  const [currentMenu, setCurrentMenu] = useState(null);
  const [currentSubmenu, setCurrentSubmenu] = useState(null);
  const [sessionId] = useState(`session_${Date.now()}`);
  const flatListRef = useRef(null);

  const assistantName = 'Tripi';

  // Test server connection
  useEffect(() => {
    testServerConnection();
  }, []);

  const testServerConnection = async () => {
    try {
      const response = await fetch('https://tripi-nu.vercel.app/api/test');
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
      if (data) {
        try {
          setMessages(JSON.parse(data));
        } catch (parseError) {
          console.error('Error parsing chat history:', parseError);
          setMessages([]);
        }
      }
    }).catch((error) => {
      console.error('Error loading chat history:', error);
      setMessages([]);
    });
  }, []);

  // Auto-scroll cuando se agregan mensajes
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Guardar historial
  useEffect(() => {
    if (messages.length > 0) {
      AsyncStorage.setItem('chatHistory', JSON.stringify(messages)).catch((error) => {
        console.error('Error saving chat history:', error);
      });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);
    setInput('');
    setIsNewChat(false);

    try {
      const res = await fetch('https://tripi-nu.vercel.app/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          message: input,
          sessionId: sessionId
        }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorData}`);
      }

      const data = await res.json();

      const assistantMessage = {
        sender: 'assistant',
        text: data.response ?? 'No hubo respuesta del servidor.',
        menu: data.menu,
        submenu: data.submenu
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Actualizar menús si están presentes
      if (data.menu) {
        setCurrentMenu(data.menu);
        setCurrentSubmenu(null);
      }
      if (data.submenu) {
        setCurrentSubmenu(data.submenu);
      }
    } catch (error) {
      console.error('Network error:', error);
      const errorMessage = error.message.includes('fetch') 
        ? 'Error de conexión. Verifica que el servidor esté ejecutándose en http://localhost:3000'
        : `Error: ${error.message}`;
        
      setMessages((prev) => [
        ...prev,
        { 
          sender: 'assistant', 
          text: errorMessage
        },
      ]);
      Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor. Verifica que esté ejecutándose.');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuSelection = async (option) => {
    const userMessage = { sender: 'user', text: option };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch('https://tripi-nu.vercel.app/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          message: option,
          sessionId: sessionId
        }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorData}`);
      }

      const data = await res.json();

      const assistantMessage = {
        sender: 'assistant',
        text: data.response ?? 'No hubo respuesta del servidor.',
        menu: data.menu,
        submenu: data.submenu
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Actualizar menús si están presentes
      if (data.menu) {
        setCurrentMenu(data.menu);
        setCurrentSubmenu(null);
      }
      if (data.submenu) {
        setCurrentSubmenu(data.submenu);
      }
    } catch (error) {
      console.error('Network error:', error);
      setMessages((prev) => [
        ...prev,
        { 
          sender: 'assistant', 
          text: 'Error de conexión. Verifica que el servidor esté ejecutándose.'
        },
      ]);
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

  const resetChat = () => {
    Alert.alert(
      'Reiniciar Chat',
      '¿Estás seguro de que querés empezar una nueva conversación? Se borrará todo el historial.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Reiniciar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Limpiar historial local
              await AsyncStorage.removeItem('chatHistory');
              setMessages([]);
              setCurrentMenu(null);
              setCurrentSubmenu(null);
              
              // Llamar al endpoint de reinicio
              const res = await fetch('https://tripi-nu.vercel.app/api/reset-chat', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify({ sessionId: sessionId }),
              });

              if (res.ok) {
                const data = await res.json();
                const resetMessage = {
                  sender: 'assistant',
                  text: data.response,
                  menu: data.menu
                };
                setMessages([resetMessage]);
                setCurrentMenu(data.menu);
                setCurrentSubmenu(null);
                setIsNewChat(true);
              } else {
                // Fallback si el endpoint falla
                const resetMessage = {
                  sender: 'assistant',
                  text: '¡Hola! Soy Tripi, tu asistente de SmarTrip 🚗\n\nTe ayudo a navegar la app y resolver todas tus dudas. ¿Qué querés saber?'
                };
                setMessages([resetMessage]);
                setIsNewChat(true);
              }
            } catch (error) {
              console.error('Error al reiniciar chat:', error);
              // Fallback en caso de error
              const resetMessage = {
                sender: 'assistant',
                text: '¡Hola! Soy Tripi, tu asistente de SmarTrip 🚗\n\nTe ayudo a navegar la app y resolver todas tus dudas. ¿Qué querés saber?'
              };
              setMessages([resetMessage]);
              setIsNewChat(true);
            }
          },
        },
      ]
    );
  };

  const renderMenuOptions = (menu) => {
    if (!menu) return null;

    return (
      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Opciones disponibles:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {menu.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuOption}
              onPress={() => handleMenuSelection(option.letra)}
            >
              <Text style={styles.menuOptionText}>
                {option.letra}. {option.pantalla}
              </Text>
              <Text style={styles.menuOptionDesc}>
                {option.descripcion}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderSubmenuOptions = (submenu) => {
    if (!submenu || !submenu.preguntas) return null;

    return (
      <View style={styles.submenuContainer}>
        <Text style={styles.submenuTitle}>
          Preguntas sobre {submenu.pantalla}:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {submenu.preguntas.map((pregunta, index) => (
            <TouchableOpacity
              key={index}
              style={styles.submenuOption}
              onPress={() => handleMenuSelection(String.fromCharCode(65 + index))}
            >
              <Text style={styles.submenuOptionText}>
                {String.fromCharCode(65 + index)}. {pregunta}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderResponseWithMenu = (item) => {
    const isFirstResponse = messages.length === 1 && item.sender === 'assistant';
    
    return (
      <View>
        <MessageBubble text={item.text} from={item.sender} />
        {item.menu && renderMenuOptions(item.menu)}
        {item.submenu && renderSubmenuOptions(item.submenu)}
        {/* Mostrar menú después de respuestas que no sean la primera */}
        {!isFirstResponse && item.sender === 'assistant' && !item.menu && !item.submenu && (
          <View style={styles.quickMenuContainer}>
            <Text style={styles.quickMenuTitle}>¿Qué más querés saber?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.quickMenuOption}
                onPress={() => handleMenuSelection('A')}
              >
                <Text style={styles.quickMenuOptionText}>A. Inicio</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickMenuOption}
                onPress={() => handleMenuSelection('B')}
              >
                <Text style={styles.quickMenuOptionText}>B. Comparar precios</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickMenuOption}
                onPress={() => handleMenuSelection('C')}
              >
                <Text style={styles.quickMenuOptionText}>C. Reservar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickMenuOption}
                onPress={() => handleMenuSelection('D')}
              >
                <Text style={styles.quickMenuOptionText}>D. Cuenta</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickMenuOption}
                onPress={() => handleMenuSelection('E')}
              >
                <Text style={styles.quickMenuOptionText}>E. Actividad</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickMenuOption}
                onPress={() => handleMenuSelection('F')}
              >
                <Text style={styles.quickMenuOptionText}>F. Método de pago</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickMenuOption}
                onPress={() => handleMenuSelection('G')}
              >
                <Text style={styles.quickMenuOptionText}>G. Premium</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickMenuOption}
                onPress={() => handleMenuSelection('H')}
              >
                <Text style={styles.quickMenuOptionText}>H. General</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickMenuOption}
                onPress={() => handleMenuSelection('I')}
              >
                <Text style={styles.quickMenuOptionText}>I. Pregunta personalizada</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickMenuOption, styles.volverOption]}
                onPress={() => handleMenuSelection('volver')}
              >
                <Text style={styles.volverOptionText}>← Volver</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 150}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Chat con {assistantName}</Text>
            <View style={styles.headerRight}>
              {isNewChat && (
                <View style={styles.newChatIndicator}>
                  <Text style={styles.newChatText}>Nueva conversación</Text>
                </View>
              )}
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
                <Text style={styles.statusText}>{getStatusText()}</Text>
              </View>
              <TouchableOpacity style={styles.resetButton} onPress={resetChat}>
                <Text style={styles.resetButtonText}>🔄</Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item }) => renderResponseWithMenu(item)}
            keyExtractor={(item, index) => index.toString()}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContainer}
          />

          {/* Mostrar menús actuales si no hay mensajes */}
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              {currentMenu && renderMenuOptions(currentMenu)}
              {currentSubmenu && renderSubmenuOptions(currentSubmenu)}
            </View>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Escribí tu mensaje..."
              multiline
              maxLength={500}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.sendButtonText}>➤</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newChatIndicator: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  newChatText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  resetButton: {
    padding: 8,
    backgroundColor: '#ff6b6b',
    borderRadius: 20,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    marginLeft: 15,
  },
  menuOption: {
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuOptionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  menuOptionDesc: {
    fontSize: 12,
    color: '#666',
  },
  submenuContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  submenuTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    marginLeft: 15,
  },
  submenuOption: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: 200,
  },
  submenuOptionText: {
    fontSize: 13,
    color: '#495057',
  },
  quickMenuContainer: {
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  quickMenuTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginLeft: 15,
  },
  quickMenuOption: {
    backgroundColor: '#fff',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickMenuOptionText: {
    fontSize: 13,
    color: '#495057',
  },
  volverOption: {
    backgroundColor: '#6c757d',
    borderColor: '#6c757d',
  },
  volverOptionText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
