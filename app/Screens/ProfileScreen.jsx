import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';

const apiUrl = Constants.expoConfig?.extra?.API_URL || '';

export default function FarmerProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    farmSize: '',
    yearsFarming: ''
  });

  const navigation = useNavigation();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        location: response.data.location || '',
        farmSize: response.data.farmSize || '',
        yearsFarming: response.data.yearsFarming || ''
      });
    } catch (err) {
      console.error("Error loading profile:", err);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`${apiUrl}/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      Alert.alert("Success", "Profile updated successfully");
      setEditing(false);
      loadProfile();
    } catch (err) {
      console.error("Error updating profile:", err);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.navigate('Login');
    // You'll need to implement your navigation logic here
    // navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Image
            source={require('../assets/profile-icon.jpg')}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editAvatarButton}>
            <MaterialIcons name="edit" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {editing ? (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <MaterialIcons name="person" size={20} color="#666" />
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
                placeholder="Full Name"
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color="#666" />
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                placeholder="Email"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="phone" size={20} color="#666" />
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => handleChange('phone', text)}
                placeholder="Phone Number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="location-on" size={20} color="#666" />
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(text) => handleChange('location', text)}
                placeholder="Location"
              />
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome name="map" size={20} color="#666" />
              <TextInput
                style={styles.input}
                value={formData.farmSize}
                onChangeText={(text) => handleChange('farmSize', text)}
                placeholder="Farm Size (acres)"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="time" size={20} color="#666" />
              <TextInput
                style={styles.input}
                value={formData.yearsFarming}
                onChangeText={(text) => handleChange('yearsFarming', text)}
                placeholder="Years Farming"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setEditing(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]}
                onPress={handleUpdateProfile}
              >
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile?.name || 'No name provided'}</Text>
            <View style={styles.infoRow}>
              <MaterialIcons name="email" size={18} color="#666" />
              <Text style={styles.infoText}>{profile?.email || 'No email provided'}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="phone" size={18} color="#666" />
              <Text style={styles.infoText}>{profile?.phone || 'No phone provided'}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={18} color="#666" />
              <Text style={styles.infoText}>{profile?.location || 'No location provided'}</Text>
            </View>
            <View style={styles.infoRow}>
              <FontAwesome name="map" size={18} color="#666" />
              <Text style={styles.infoText}>{profile?.farmSize ? `${profile.farmSize} acres` : 'Farm size not specified'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time" size={18} color="#666" />
              <Text style={styles.infoText}>{profile?.yearsFarming ? `${profile.yearsFarming} years farming` : 'Experience not specified'}</Text>
            </View>

            <TouchableOpacity 
              style={[styles.button, styles.editButton]}
              onPress={() => setEditing(true)}
            >
              <MaterialIcons name="edit" size={18} color="#fff" />
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile?.totalOrders || 0}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile?.activeOrders || 0}</Text>
          <Text style={styles.statLabel}>Active Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile?.rating ? profile.rating.toFixed(1) : 'N/A'}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <MaterialIcons name="logout" size={20} color="#F44336" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 15,
    color: '#666',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    width: '100%',
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 15,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    marginTop: 20,
    alignSelf: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    flex: 0.7,
  },
  cancelButton: {
    backgroundColor: '#9E9E9E',
    flex: 0.3,
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    width: '30%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  logoutText: {
    color: '#F44336',
    fontWeight: '500',
    marginLeft: 8,
  },
});