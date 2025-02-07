import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChatbotScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chatbot</Text>
      <Text style={styles.description}>Get instant answers to your queries.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});

export default ChatbotScreen;
