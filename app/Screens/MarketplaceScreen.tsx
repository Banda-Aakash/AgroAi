// screens/MarketplaceScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MarketplaceScreen() {
  const [crops, setCrops] = useState([]);

  const fetchCrops = async () => {
    const snapshot = await getDocs(collection(db, "crops"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCrops(data);
  };

  const addToCart = async (item) => {
    try {
      const cleanItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        userId: item.userId, // ✅ include this to avoid undefined error
      };
  
      const storedCart = await AsyncStorage.getItem('cart');
      let cart = storedCart ? JSON.parse(storedCart) : [];
  
      cart.push(cleanItem);
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
  
      alert('Added to cart!');
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart. Try again.");
    }
  };
  
  
  

  useEffect(() => {
    fetchCrops();
  }, []);

  return (
    <FlatList
      data={crops}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ padding: 10 }}>
          <Text>{item.name} - ₹{item.price} ({item.quantity} kg)</Text>
          <Button title="Add to Cart" onPress={() => addToCart(item)} />
        </View>
      )}
    />
  );
}
