import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";

import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.API_URL || '';

const CropRecommendationScreen = () => {
  const [formData, setFormData] = useState({
    N: "",
    P: "",
    K: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: "",
  });

  const [recommendedCrop, setRecommendedCrop] = useState("");

  // Function to handle input changes
  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  // Function to send data to Flask API
  const handleSubmit = async () => {
    console.log("hi")
    try {
      const response = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          N: parseFloat(formData.N),
          P: parseFloat(formData.P),
          K: parseFloat(formData.K),
          temperature: parseFloat(formData.temperature),
          humidity: parseFloat(formData.humidity),
          ph: parseFloat(formData.ph),
          rainfall: parseFloat(formData.rainfall),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRecommendedCrop(data.recommended_crop);
      } else {
        Alert.alert("Error", data.error);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to the server.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crop Recommendation</Text>

      <TextInput
        style={styles.input}
        placeholder="Nitrogen (N)"
        keyboardType="numeric"
        onChangeText={(text) => handleChange("N", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Phosphorus (P)"
        keyboardType="numeric"
        onChangeText={(text) => handleChange("P", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Potassium (K)"
        keyboardType="numeric"
        onChangeText={(text) => handleChange("K", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Temperature (°C)"
        keyboardType="numeric"
        onChangeText={(text) => handleChange("temperature", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Humidity (%)"
        keyboardType="numeric"
        onChangeText={(text) => handleChange("humidity", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="pH Level"
        keyboardType="numeric"
        onChangeText={(text) => handleChange("ph", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Rainfall (mm)"
        keyboardType="numeric"
        onChangeText={(text) => handleChange("rainfall", text)}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Get Recommendation</Text>
      </TouchableOpacity>

      {recommendedCrop ? (
        <Text style={styles.result}>Recommended Crop: {recommendedCrop}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8F8F8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "90%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingLeft: 10,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: "#FFF",
  },
  button: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    width: "90%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "bold",
  },
  result: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
  },
});

export default CropRecommendationScreen;
