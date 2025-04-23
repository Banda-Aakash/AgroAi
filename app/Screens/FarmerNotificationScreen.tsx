import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const apiUrl = Constants.expoConfig?.extra?.API_URL || '';

export default function FarmerNotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error("Error loading notifications:", err);
      Alert.alert("Error", "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${apiUrl}/notifications/${id}`, { status }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      loadNotifications();
    } catch (err) {
      console.error("Error updating notification:", err);
      Alert.alert("Error", "Failed to update order status");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const renderItem = ({ item }) => {
    // Safely get values with fallbacks
    const orderId = item?._id?item._id.slice(0, 8): 'N/A';
    console.log(orderId)
    const buyerId = item?.buyerId ? item.buyerId.slice(0, 8) : 'N/A';
    console.log(buyerId)
    const status = item?.status || 'pending';
    const cropName = item?.cropName || 'Unknown Crop';
    const quantity = item?.quantity || 0;
    const totalPrice = item?.totalPrice || 0;
    const imageId = item?.image_id || '';

    const statusColor = {
      'pending': '#FFA500',
      'accepted': '#4CAF50',
      'rejected': '#F44336'
    }[status] || '#9E9E9E';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>Order #{orderId}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
        
        <View style={styles.cardBody}>
          <Image
            source={{ uri: `${apiUrl}/get-image?image_id=${imageId}` }}
            style={styles.image}
            // defaultSource={require('./placeholder-image.png')} // Add a placeholder image
          />
          <View style={styles.cardContent}>
            <Text style={styles.cropName}>{cropName}</Text>
            <View style={styles.detailRow}>
              <MaterialIcons name="scale" size={16} color="#666" />
              <Text style={styles.detailText}>{quantity} kg</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="attach-money" size={16} color="#666" />
              <Text style={styles.detailText}>₹{totalPrice}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="person" size={16} color="#666" />
              <Text style={styles.detailText}>Buyer ID: {buyerId}...</Text>
            </View>
          </View>
        </View>

        {status === 'pending' && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={() => handleUpdateStatus(item._id, 'rejected')}
            >
              <MaterialIcons name="cancel" size={18} color="#fff" />
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={() => handleUpdateStatus(item._id, 'accepted')}
            >
              <MaterialIcons name="check-circle" size={18} color="#fff" />
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Orders</Text>
        <Text style={styles.headerSubtitle}>Manage incoming purchase requests</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContainer}
          data={notifications}
          keyExtractor={(item) => (item._id || item.id || Math.random()).toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="notifications-none" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No orders yet</Text>
              <Text style={styles.emptySubtext}>You'll see purchase requests here when buyers order your crops</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  cardBody: {
    flexDirection: 'row',
    padding: 15,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  cropName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    color: '#666',
  },
});