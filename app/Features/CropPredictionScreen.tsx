import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.API_URL || '';

const CropPredictionScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crop Prediction</Text>
      <Text style={styles.description}>
        Use AI to predict the best crops to grow.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});

export default CropPredictionScreen;
