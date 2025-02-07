import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const YieldPredictionScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yield Prediction</Text>
      <Text style={styles.description}>
        Estimate crop yields based on data.
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

export default YieldPredictionScreen;
