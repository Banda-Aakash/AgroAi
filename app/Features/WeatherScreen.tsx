import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WeatherScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather Forecast</Text>
      <Text style={styles.description}>
        Plan farming with real-time weather updates.
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

export default WeatherScreen;
