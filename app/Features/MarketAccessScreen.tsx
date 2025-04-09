import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigation } from "@react-navigation/native";
import { getAuth } from 'firebase/auth';

export default function MarketAccessScreen() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const navigation = useNavigation();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const handleAdd = async () => {
    if (!name || !price || !quantity) {
      alert("Please fill all fields.");
      return;
    }

    if (!currentUser) {
      alert("User not logged in.");
      return;
    }

    try {
      await addDoc(collection(db, "crops"), {
        name,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        userId: currentUser.uid, // ✅ associate with logged-in user
        timestamp: new Date()
      });

      setName('');
      setPrice('');
      setQuantity('');
      console.log("Crop added successfully");
      navigation.navigate("HomeTabs");
    } catch (error) {
      console.error("Error adding crop: ", error);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Add New Crop</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName} />
      <TextInput placeholder="Price" keyboardType="numeric" value={price} onChangeText={setPrice} />
      <TextInput placeholder="Quantity" keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
      <Button title="Add Crop" onPress={handleAdd} />
    </View>
  );
}
