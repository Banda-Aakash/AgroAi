import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase'; // your firebase config
import { getAuth } from 'firebase/auth'; // to get current user

export default function CartScreen() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  const loadCart = async () => {
    try {
      const stored = await AsyncStorage.getItem('cart');
      if (stored) {
        const parsedCart = JSON.parse(stored);
        console.log("Loaded cart:", parsedCart);
        setCart(parsedCart);
        calculateTotal(parsedCart);
      } else {
        setCart([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("Error loading cart:", err);
    }
  };

  const calculateTotal = (items: any[]) => {
    const sum = items.reduce((acc, item) => acc + item.price, 0);
    setTotal(sum);
  };

  const checkout = async () => {
    try {
      Alert.alert(
        'Confirm Purchase',
        `Total: ₹${total}. Proceed to checkout?`,
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'OK',
            onPress: async () => {
              try {
                const auth = getAuth();
                const buyerId = auth.currentUser?.uid;
                console.log("Buyer ID:", buyerId);

                // Notify farmers
                for (const item of cart) {
                  console.log("Sending notification for:", item);

                  const docRef = await addDoc(collection(db, 'notifications'), {
                    toUserId: item.userId,
                    cropName: item.name,
                    quantity: item.quantity,
                    totalPrice: item.price,
                    timestamp: serverTimestamp(),
                    buyerId: buyerId
                  });

                  console.log("Notification sent, doc ID:", docRef.id);
                }

                // Clear cart
                await AsyncStorage.removeItem('cart');
                setCart([]);
                setTotal(0);
                Alert.alert('Success', 'Order placed successfully!');
              } catch (innerErr) {
                console.error("Failed inside checkout OK handler:", innerErr);
                Alert.alert('Error', 'Could not complete checkout.');
              }
            }
          }
        ]
      );
    } catch (err) {
      console.error("Checkout error:", err);
      Alert.alert('Error', 'Checkout failed. Try again.');
    }
  };

  const clearCart = async () => {
    Alert.alert(
      'Confirm',
      'Are you sure you want to clear your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('cart');
              setCart([]);
              setTotal(0);
              Alert.alert('Cart Cleared', 'Your cart has been emptied.');
            } catch (error) {
              console.error("Error clearing cart:", error);
              Alert.alert('Error', 'Failed to clear cart.');
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  const renderItem = ({ item }: any) => (
    <View style={styles.item}>
      <Text>{item.name} - ₹{item.price}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {cart.length === 0 ? (
        <Text style={styles.empty}>Your cart is empty.</Text>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
          />
          <Text style={styles.total}>Total: ₹{total}</Text>
          <View style={{ marginTop: 10 }}>
            <Button title="Checkout" onPress={checkout} />
            <View style={{ height: 10 }} />
            <Button title="Clear Cart" onPress={clearCart} color="#cc0000" />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  item: { marginBottom: 10 },
  total: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  empty: { fontSize: 16, textAlign: 'center', marginTop: 40 }
});
