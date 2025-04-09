import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

export default function FarmerNotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setRefreshing(true);
      const auth = getAuth();
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) return;

      const q = query(
        collection(db, 'notifications'),
        where('toUserId', '==', currentUserId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { status });
      fetchNotifications(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'accepted') return { color: 'green' };
    if (status === 'rejected') return { color: 'red' };
    return { color: 'orange' }; // pending or undefined
  };

  const renderItem = ({ item }: any) => {
    const formattedDate = item.timestamp?.seconds
      ? new Date(item.timestamp.seconds * 1000).toLocaleString()
      : 'N/A';

    return (
      <View style={styles.card}>
        <Text style={styles.crop}>
          {item.cropName || 'Unknown Crop'} - {item.quantity} kg
        </Text>
        <Text style={styles.detail}>Ordered by: {item.buyerId?.slice(0, 6)}...</Text>
        <Text style={styles.detail}>Total Price: ₹{item.totalPrice}</Text>
        <Text style={styles.timestamp}>{formattedDate}</Text>

        <Text style={[styles.status, getStatusColor(item.status)]}>
          Status: {item.status || 'pending'}
        </Text>

        {(!item.status || item.status === 'pending') && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.accept]}
              onPress={() => updateStatus(item.id, 'accepted')}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.reject]}
              onPress={() => updateStatus(item.id, 'rejected')}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Order Notifications</Text>
      {notifications.length === 0 ? (
        <Text style={styles.empty}>No orders yet.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchNotifications} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  crop: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  detail: { fontSize: 14, color: '#555' },
  timestamp: { fontSize: 12, color: '#888', marginTop: 6 },
  status: { fontSize: 14, marginTop: 8, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 0.48,
    padding: 10,
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
