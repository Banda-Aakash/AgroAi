import React, {useState} from 'react';
import {View, Text,TextInput,TouchableOpacity, StyleSheet} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

const LoginScreen: React.FC<Props> = ({navigation}) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleLogin = () => {
    if (phoneNumber.length === 10) {
      navigation.navigate('Otp', {phoneNumber});
    } else {
      alert('Enter a valid 10-digit phone number.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AgroAi</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Mobile Number"
        keyboardType="phone-pad"
        maxLength={10}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      {/* <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Send OTP</Text>
      </TouchableOpacity> */}
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
    fontSize: 32, 
    fontWeight: 'bold', 
    marginBottom: 20
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 15,
    marginBottom: 20,
    backgroundColor: '',
  },
  button: {backgroundColor: '#4CAF50', padding: 10, borderRadius: 5},
  buttonText: {color: 'white', fontSize: 16},
});

export default LoginScreen;
