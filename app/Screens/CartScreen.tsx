import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.API_URL || '';

export default function CartScreen() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  const loadCart = async () => {
    try {
      const stored = await AsyncStorage.getItem('cart');
      console.log(`cart${stored}`)
      if (stored) {
        const parsedCart = JSON.parse(stored);
        console.log(parsedCart)
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
    const sum = items.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
    setTotal(sum);
  };

  const checkout = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token);
      if (!token) {
        Alert.alert('Error', 'You are not logged in.');
        return;
      }

      Alert.alert(
        'Confirm Purchase',
        `Total: ₹${total}. Proceed to checkout?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'OK',
            onPress: async () => {
              console.log(apiUrl)
              try {
                const response = await axios.post(`${apiUrl}/checkout`, {
                  cartItems: cart,
                }, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  }                  
                });

                if (response.data.success) {
                  await AsyncStorage.removeItem('cart');
                  setCart([]);
                  setTotal(0);
                  Alert.alert('Success', 'Order placed successfully!');
                } else {
                  Alert.alert('Error', 'Checkout failed. Try again.');
                }
              } catch (err) {
                console.error("Checkout error:", err);
                Alert.alert('Error', 'Could not complete checkout.');
              }
            }
          }
        ]
      );
    } catch (err) {
      console.error("Checkout error:", err);
      Alert.alert('Error', 'Checkout failed.');
    }
  };

  const clearCart = async () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to clear your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('cart');
            setCart([]);
            setTotal(0);
          }
        }
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  const renderItem = ({ item }: any) => {
    console.log("Cart Item:", item); // 👈 This logs each cart item, including image_id
  
    return (
      <View style={styles.card}>
        <Image
          source={{ uri: `${apiUrl}/get-image?image_id=${item.image_id}` }}
          style={styles.image}
        />
        <View style={styles.cardContent}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>₹{item.price} × {item.quantity || 1}</Text>
          <Text style={styles.subtotal}>Subtotal: ₹{item.price * (item.quantity || 1)}</Text>
        </View>
      </View>
    );
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {cart.length === 0 ? (
        <Text style={styles.empty}>Your cart is empty.</Text>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            scrollEnabled={false}
          />
          <View style={styles.footer}>
            <Text style={styles.total}>Total: ₹{total}</Text>
            <TouchableOpacity style={styles.checkoutBtn} onPress={checkout}>
              <Text style={styles.btnText}>Checkout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearBtn} onPress={clearCart}>
              <Text style={styles.btnText}>Clear Cart</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: 90,
    height: 90,
    resizeMode: 'cover',
  },
  cardContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 14,
    color: '#555',
  },
  subtotal: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  footer: {
    marginTop: 20,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  checkoutBtn: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  clearBtn: {
    backgroundColor: '#e53935',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
  },
  empty: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
