import React, { useState } from 'react';
import axios from 'axios';
import { View, Text, TextInput, Button, ActivityIndicator } from 'react-native';

const YieldPredictionScreen = () => {
  const [crop, setCrop] = useState('');
  const [cropYear, setCropYear] = useState('');
  const [season, setSeason] = useState('');
  const [state, setState] = useState('');
  const [area, setArea] = useState('');
  const [annualRainfall, setAnnualRainfall] = useState('');
  const [fertilizer, setFertilizer] = useState('');
  const [pesticide, setPesticide] = useState('');
  const [predictedYield, setPredictedYield] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setPredictedYield(null);

    try {
      console.log('Requesting prediction...');
      
      const response = await axios.post('https://f7cf-2405-201-c011-a820-f069-fb96-b8b9-c3bb.ngrok-free.app/yield_predict', {
        Crop: crop,
        Crop_Year: parseInt(cropYear),
        Season: season,
        State: state,
        Area: parseFloat(area),
        Annual_Rainfall: parseFloat(annualRainfall),
        Fertilizer: parseFloat(fertilizer),
        Pesticide: parseFloat(pesticide),
      });

      console.log('Response:', response.data);

      if (response.data.predicted_yield) {
        setPredictedYield(response.data.predicted_yield);
      } else {
        setError('Failed to retrieve prediction. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Error predicting yield. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Crop Yield Prediction</Text>

      <TextInput
        placeholder="Crop"
        value={crop}
        onChangeText={(text) => setCrop(text)}
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginVertical: 10, paddingLeft: 10 }}
      />
      <TextInput
        placeholder="Crop Year"
        value={cropYear}
        onChangeText={(text) => setCropYear(text)}
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginVertical: 10, paddingLeft: 10 }}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Season"
        value={season}
        onChangeText={(text) => setSeason(text)}
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginVertical: 10, paddingLeft: 10 }}
      />
      <TextInput
        placeholder="State"
        value={state}
        onChangeText={(text) => setState(text)}
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginVertical: 10, paddingLeft: 10 }}
      />
      <TextInput
        placeholder="Area (in hectares)"
        value={area}
        onChangeText={(text) => setArea(text)}
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginVertical: 10, paddingLeft: 10 }}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Annual Rainfall (in mm)"
        value={annualRainfall}
        onChangeText={(text) => setAnnualRainfall(text)}
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginVertical: 10, paddingLeft: 10 }}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Fertilizer (kg)"
        value={fertilizer}
        onChangeText={(text) => setFertilizer(text)}
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginVertical: 10, paddingLeft: 10 }}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Pesticide (kg)"
        value={pesticide}
        onChangeText={(text) => setPesticide(text)}
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginVertical: 10, paddingLeft: 10 }}
        keyboardType="numeric"
      />
      
      <Button title="Predict Yield" onPress={handleSubmit} />

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text>}
      {predictedYield && <Text style={{ fontSize: 20, marginTop: 20 }}>Predicted Yield: {predictedYield} tons/ha</Text>}
    </View>
  );
};

export default YieldPredictionScreen;
