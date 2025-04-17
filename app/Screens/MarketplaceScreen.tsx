import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Alert, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useFocusEffect } from '@react-navigation/native';

const apiUrl = Constants.expoConfig?.extra?.API_URL || ''; // API URL for Flask

export default function MarketplaceScreen() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [numColumns, setNumColumns] = useState(2); // State to manage columns

  // Fetch the JWT token from AsyncStorage
  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      } else {
        Alert.alert("Error", "User not logged in.");
      }
    };

    fetchToken();
  }, []);

  // Fetch crops from MongoDB
  const fetchCrops = async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${apiUrl}/crops`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setCrops(response.data.crops);
    } catch (error) {
      console.error("Error fetching crops:", error);
      Alert.alert("Error", "Failed to fetch crops.");
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart functionality
  const addToCart = async (item) => {
    try {
      console.log(item)
      const cleanItem = {
        id: item._id, // MongoDB uses _id instead of id
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        userId: item.user_id,
        image_id: item.image_id
      };
      console.log(item.user_id)

      const storedCart = await AsyncStorage.getItem('cart');
      let cart = storedCart ? JSON.parse(storedCart) : [];

      cart.push(cleanItem);
      await AsyncStorage.setItem('cart', JSON.stringify(cart));

      Alert.alert('Success', 'Added to cart!');
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "Failed to add to cart. Try again.");
    }
  };

  // Handle screen resizing and dynamically adjust number of columns
  useEffect(() => {
    const updateColumns = () => {
      const screenWidth = Dimensions.get('window').width;
      setNumColumns(screenWidth > 600 ? 3 : 2); // Show 3 columns on larger screens, 2 on smaller
    };

    updateColumns(); // Initial column setup
    Dimensions.addEventListener('change', updateColumns); // Listen for screen resizing

    return () => {
      Dimensions.removeEventListener('change', updateColumns); // Cleanup listener
    };
  }, []);

  // Call the fetchCrops function when the token is set
  useEffect(() => {
    if (token) {
      fetchCrops();
    }
  }, [token]);


  // Render each crop item
  const renderItem = ({ item }) => (
    <View style={styles.productContainer}>
      <Image
        source={{ uri: `${apiUrl}/get-image?image_id=${item.image_id}` }} // Assuming you have image ID in the crop data
        style={styles.productImage}
        resizeMode="contain"
      />
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>₹{item.price}</Text>
        <Text style={styles.productQuantity}>{item.quantity} kg</Text>
        <TouchableOpacity style={styles.addToCartButton} onPress={() => addToCart(item)}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <Text>Loading crops...</Text>;
  }

  if (crops.length === 0) {
    return <Text>No crops available at the moment.</Text>; // Message when no crops are available
  }

  return (
    <FlatList
      data={crops}
      keyExtractor={(item) => item._id} // MongoDB uses _id
      renderItem={renderItem}
      numColumns={numColumns} 
      key={numColumns} // Force re-render when numColumns changes
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 10,
  },
  productContainer: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    elevation: 5, // For shadow effect on Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    overflow: 'hidden',
    width: '45%', // To fit 2 columns
    marginBottom: 20,
  },
  productImage: {
    width: '100%',
    height: 150,
  },
  productDetails: {
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 5,
  },
  productQuantity: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 10,
  },
  addToCartButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  addToCartText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
