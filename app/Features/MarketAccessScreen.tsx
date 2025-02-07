import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MarketAccessScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Market Access</Text>
      <Text style={styles.description}>
        Connect with buyers and sellers easily.
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

export default MarketAccessScreen;
