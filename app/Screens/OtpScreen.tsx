import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, TextInput, Title, Text } from 'react-native-paper';
import auth from '@react-native-firebase/auth';

// const OtpScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const OtpScreen = ({navigation }: {navigation: any }) => {
  const [otp, setOtp] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  // const { confirm } = route.params;

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      // const credential = auth.PhoneAuthProvider.credential(confirm.verificationId, otp);
      // await auth().signInWithCredential(credential);
      Alert.alert('Success', 'OTP Verified!');
      // navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Enter OTP</Title>
      <Text style={styles.subtitle}>We’ve sent an OTP to your phone number</Text>
      <TextInput
        label="OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        style={styles.input}
        left={<TextInput.Icon name="lock" />}
      />
      <Button
        mode="contained"
        onPress={handleVerifyOtp}
        loading={loading}
        disabled={loading || !otp}
        style={styles.button}
      >
        Verify OTP
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});

export default OtpScreen;