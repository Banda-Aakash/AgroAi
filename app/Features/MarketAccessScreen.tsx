import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from "@react-navigation/native";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import * as mime from 'react-native-mime-types';

import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.API_URL || '';
// Polyfill for Buffer if needed
global.Buffer = Buffer;



export default function MarketAccessScreen() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      // Get media permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access gallery is required!'); 
      }

      // Get JWT token from storage
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8, // Slightly reduced quality for smaller file size
      });
  
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      console.log("Error picking image:", err);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const uploadImageToMongo = async (uri) => {
    if (!uri) return null;
  
    try {
      const formData = new FormData();
      const fileUri = uri;
      const filename = fileUri.split('/').pop();
      const fileType = mime.lookup(fileUri) || 'image/jpeg';
      const file = {
        uri: fileUri,
        name: filename,
        type: fileType,
      };
  
      formData.append('image', file);
  
      const response = await axios.post(
        `${apiUrl}/upload-image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );
  
      return response.data.imageId;
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload image");
      return null;
    }
  };
  
  const handleAdd = async () => {
    if (!name || !price || !quantity) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
  
    if (!token) {
      Alert.alert("Error", "User not logged in.");
      return;
    }
  
    try {
      setUploading(true);
      const imageId = image ? await uploadImageToMongo(image) : null;
  
      const cropData = {
        name,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        imageId
      };
  
      const response = await axios.post(`${apiUrl}/crops`, cropData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
  
      setName('');
      setPrice('');
      setQuantity('');
      setImage(null);
      navigation.navigate("HomeTabs");
      Alert.alert("Success", "Crop added successfully!");
    } catch (error) {
      console.error("Error adding crop: ", error);
      Alert.alert("Error", "Something went wrong. Try again.");
    } finally {
      setUploading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Add New Crop</Text>
      <TextInput 
        placeholder="Name" 
        value={name} 
        onChangeText={setName} 
        style={styles.input} 
      />
      <TextInput 
        placeholder="Price" 
        keyboardType="numeric" 
        value={price} 
        onChangeText={setPrice} 
        style={styles.input} 
      />
      <TextInput 
        placeholder="Quantity" 
        keyboardType="numeric" 
        value={quantity} 
        onChangeText={setQuantity} 
        style={styles.input} 
      />

      <Button title="Pick Image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}

      <Button 
        title={uploading ? "Uploading..." : "Add Crop"} 
        onPress={handleAdd} 
        disabled={uploading} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderBottomWidth: 1,
    marginBottom: 10,
    paddingVertical: 8,
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 10,
    borderRadius: 10,
    alignSelf: 'center',
  },
});