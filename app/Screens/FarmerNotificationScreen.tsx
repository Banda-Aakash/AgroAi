import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const apiUrl = Constants.expoConfig?.extra?.API_URL || ''; // Your API URL

export default function FarmerNotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);

  const loadNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('token'); // Make sure token is saved as 'token'
    
      const response = await axios.get(`${apiUrl}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    
      setNotifications(response.data.notifications);
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      // Send a request to update the notification status
      await axios.patch(`${apiUrl}/notifications/${id}`, { status });
      loadNotifications(); // Reload notifications after status update
    } catch (err) {
      console.error("Error updating notification:", err);
    }
  };

  // Replace useEffect with useFocusEffect
  useFocusEffect(
    useCallback(() => {
      loadNotifications(); // This will be called every time the screen gains focus
    }, [])
  );

  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <Image
          source={{ uri: `${apiUrl}/get-image?image_id=${item.image_id}` }} // Assuming you have image handling
          style={styles.image}
        />
        <View style={styles.cardContent}>
          <Text style={styles.crop}>
            {item.cropName || 'Unknown Crop'} - {item.quantity} kg
          </Text>
          <Text style={styles.detail}>Ordered by: {item.buyerId?.slice(0, 6)}...</Text>
          <Text style={styles.detail}>Total Price: ₹{item.totalPrice}</Text>

          <Text style={styles.status}>
            Status: {item.status || 'Pending'}
          </Text>

          {(!item.status || item.status === 'pending') && (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.accept]}
                onPress={() => handleUpdateStatus(item.id, 'accepted')}
              >
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.reject]}
                onPress={() => handleUpdateStatus(item.id, 'rejected')}
              >
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {notifications.length === 0 ? (
        <Text style={styles.empty}>No orders yet.</Text>
      ) : (
        <FlatList
          data={notifications}
          // keyExtractor={(item) => item.id.toString()}
          keyExtractor={(item) => (item._id || item.id).toString()}

          renderItem={renderItem}
        />
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
  crop: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detail: {
    fontSize: 14,
    color: '#555',
  },
  status: {
    fontSize: 14,
    color: '#888',
    marginTop: 6,
    fontWeight: '600',
  },
  empty: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 0.48,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  accept: {
    backgroundColor: '#4CAF50',
  },
  reject: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
