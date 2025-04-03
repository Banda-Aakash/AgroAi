import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const YieldPredictionScreen = () => {
  const [inputs, setInputs] = useState({
    crop: 'Barley', // Default selection
    cropYear: '',
    season: 'Kharif', // Default selection
    state: 'Andhra Pradesh', // Default selection
    area: '',
    annualRainfall: '',
    fertilizer: '',
    pesticide: ''
  });
  const [predictedYield, setPredictedYield] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const seasons = ['Whole Year', 'Kharif', 'Rabi', 'Autumn', 'Summer', 'Winter'];
  const states = [
    'Assam', 'Karnataka', 'Kerala', 'Meghalaya', 'West Bengal', 'Puducherry', 'Goa', 
    'Andhra Pradesh', 'Tamil Nadu', 'Odisha', 'Bihar', 'Gujarat', 'Madhya Pradesh', 
    'Maharashtra', 'Mizoram', 'Punjab', 'Uttar Pradesh', 'Haryana', 'Himachal Pradesh', 
    'Tripura', 'Nagaland', 'Chhattisgarh', 'Uttarakhand', 'Jharkhand', 'Delhi', 'Manipur', 
    'Jammu and Kashmir', 'Telangana', 'Arunachal Pradesh', 'Sikkim'
  ];
  const crops = [
    'Barley', 'Coffee', 'Cotton', 'Ground Nuts', 'Kidneybeans', 'Maize', 'Millets', 
    'Oil seeds', 'Orange', 'Paddy', 'Pomegranate', 'Pulses', 'Rice', 
    'Sugarcane', 'Tobacco', 'Watermelon', 'Wheat'
  ];

  const handleChange = (name, value) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setPredictedYield(null);
  
    try {
      const response = await axios.post(
        'https://f7cf-2405-201-c011-a820-f069-fb96-b8b9-c3bb.ngrok-free.app/yield_predict',
        {
          Crop: inputs.crop,
          Crop_Year: Number(inputs.cropYear),  // Convert to number
          Season: inputs.season,
          State: inputs.state,
          Area: Number(inputs.area),  // Convert to number
          Annual_Rainfall: Number(inputs.annualRainfall),  // Convert to number
          Fertilizer: Number(inputs.fertilizer),  // Convert to number
          Pesticide: Number(inputs.pesticide)  // Convert to number
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      setPredictedYield(response.data.predicted_yield);
    } catch (err) {
      console.log(err.response.data); // Helps to see the actual error
      setError('Error predicting yield. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Crop Yield Prediction</Text>

      <Text style={styles.label}>Select Crop:</Text>
      <Picker
        selectedValue={inputs.crop}
        onValueChange={(value) => handleChange('crop', value)}
        style={styles.picker}
      >
        {crops.map((crop) => (
          <Picker.Item key={crop} label={crop} value={crop} />
        ))}
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Crop Year"
        value={inputs.cropYear}
        onChangeText={(value) => handleChange('cropYear', value)}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Select Season:</Text>
      <Picker
        selectedValue={inputs.season}
        onValueChange={(value) => handleChange('season', value)}
        style={styles.picker}
      >
        {seasons.map((season) => (
          <Picker.Item key={season} label={season} value={season} />
        ))}
      </Picker>

      <Text style={styles.label}>Select State:</Text>
      <Picker
        selectedValue={inputs.state}
        onValueChange={(value) => handleChange('state', value)}
        style={styles.picker}
      >
        {states.map((state) => (
          <Picker.Item key={state} label={state} value={state} />
        ))}
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Area (in hectares)"
        value={inputs.area}
        onChangeText={(value) => handleChange('area', value)}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Annual Rainfall (in mm)"
        value={inputs.annualRainfall}
        onChangeText={(value) => handleChange('annualRainfall', value)}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Fertilizer (kg)"
        value={inputs.fertilizer}
        onChangeText={(value) => handleChange('fertilizer', value)}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Pesticide (kg)"
        value={inputs.pesticide}
        onChangeText={(value) => handleChange('pesticide', value)}
        keyboardType="numeric"
      />

      <Button title="Predict Yield" onPress={handleSubmit} />

      {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}
      {error && <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text>}
      {predictedYield && (
        <Text style={styles.result}>Predicted Yield: {predictedYield} tons/ha</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  label: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold'
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    padding: 10,
    backgroundColor: 'white'
  },
  picker: {
    height: 50,
    marginVertical: 12,
    backgroundColor: 'white'
  },
  result: {
    marginTop: 20,
    fontSize: 18,
    color: 'green'
  }
});

export default YieldPredictionScreen;
