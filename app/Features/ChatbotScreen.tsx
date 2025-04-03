import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from "react-native";

// Get the screen width and height for responsiveness
const { width, height } = Dimensions.get("window");

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (userInput.trim() === "") return;

    const userMessage = { sender: "User", text: userInput };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setUserInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://c117-2405-201-c011-a820-adcd-a56d-838b-763c.ngrok-free.app/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: userInput }),
        }
      );

      const data = await response.json();
      const botMessage = {
        sender: "AgroBuddy",
        text: data.response || "Sorry, I could not understand that.",
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      const errorMessage = {
        sender: "AgroBuddy",
        text: "Failed to connect to the server. Please try again later.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setLoading(false);
  };

  // Function to render message with bold text
  const renderMessageText = (message) => {
    const parts = message.split(/(\*\*.*?\*\*)/); // Split by text enclosed with **
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <Text key={index} style={styles.boldText}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.chatContainer}>
        <View style={styles.centeredContainer}>
          <Text style={styles.bText}>AgroBuddy</Text>
        </View>
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              message.sender === "User"
                ? styles.userMessageContainer
                : styles.botMessageContainer,
            ]}
          >
            <Text style={styles.messageText}>
              {renderMessageText(message.text)}
            </Text>
          </View>
        ))}

        {loading && (
          <View style={[styles.messageContainer, styles.botMessageContainer]}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Ask AgroBuddy..."
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={loading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  boldText: {
    fontWeight: "bold",
    fontSize: 16, // Adjusted font size for better readability
  },
  bText: {
    fontWeight: "bold",
    fontSize: width * 0.07, // Responsive font size (based on screen width)
  },
  chatContainer: {
    flex: 1,
    paddingLeft: width * 0.025,
    paddingRight: width * 0.025,
    paddingBottom: 0,
  },
  messageContainer: {
    padding: width * 0.03, // Responsive padding
    marginVertical: height * 0.015, // Responsive margin
    maxWidth: "80%",
    borderRadius: 18,
  },
  userMessageContainer: {
    backgroundColor: "black",
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  botMessageContainer: {
    backgroundColor: "green",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  messageText: {
    color: "#fff",
    fontSize: width * 0.04, // Responsive font size for message text
  },
  inputContainer: {
    flexDirection: "row",
    padding: width * 0.03, // Responsive padding
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: width * 0.04, // Responsive padding
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    marginRight: width * 0.05, // Responsive margin
    backgroundColor: "#F8F8F8",
  },
  sendButton: {
    backgroundColor: "#4F8EF7",
    paddingVertical: height * 0.02, // Responsive padding
    paddingHorizontal: width * 0.05, // Responsive padding
    borderRadius: 25,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: width * 0.04, // Responsive font size
  },
});

export default ChatbotScreen;
