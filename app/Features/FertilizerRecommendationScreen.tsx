import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.API_URL || '';

const FertilizerRecommendationScreen = () => {
    const [inputs, setInputs] = useState({
        temperature: '',
        humidity: '',
        moisture: '',
        soilType: 'Black', // Default selection
        cropType: 'Barley', // Default selection
        nitrogen: '',
        potassium: '',
        phosphorous: ''
    });
    const [recommendedFertilizer, setRecommendedFertilizer] = useState(null);

    const soilTypes = ['Black', 'Clayey', 'Loamy', 'Red', 'Sandy'];
    const cropTypes = [
        'Barley', 'Coffee', 'Cotton', 'Ground Nuts', 'Kidneybeans', 'Maize', 'Millets', 
        'Oil seeds', 'Orange', 'Paddy', 'Pomegranate', 'Pulses', 'Rice', 
        'Sugarcane', 'Tobacco', 'Watermelon', 'Wheat'
    ];

    const handleChange = (name, value) => {
        setInputs(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post(`${apiUrl}/fertilizer_predict`, {
                temperature: parseFloat(inputs.temperature),
                humidity: parseFloat(inputs.humidity),
                moisture: parseFloat(inputs.moisture),
                soil_type: inputs.soilType,
                crop_type: inputs.cropType,
                N: parseFloat(inputs.nitrogen),
                K: parseFloat(inputs.potassium),
                P: parseFloat(inputs.phosphorous)
            });
            console.log('Response:', response.data); // Log the response for debugging
            setRecommendedFertilizer(response.data.recommended_fertilizer); // Ensure this key matches your backend response
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message); // Log the error
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };
    
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Fertilizer Recommendation</Text>

            <TextInput
                style={styles.input}
                placeholder="Temperature (°C)"
                value={inputs.temperature}
                onChangeText={(value) => handleChange('temperature', value)}
                keyboardType="numeric"
            />

            <TextInput
                style={styles.input}
                placeholder="Humidity (%)"
                value={inputs.humidity}
                onChangeText={(value) => handleChange('humidity', value)}
                keyboardType="numeric"
            />

            <TextInput
                style={styles.input}
                placeholder="Moisture (%)"
                value={inputs.moisture}
                onChangeText={(value) => handleChange('moisture', value)}
                keyboardType="numeric"
            />

            <Text style={styles.label}>Select Soil Type:</Text>
            <Picker
                selectedValue={inputs.soilType}
                onValueChange={(value) => handleChange('soilType', value)}
                style={styles.picker}
            >
                {soilTypes.map((soil) => (
                    <Picker.Item key={soil} label={soil} value={soil} />
                ))}
            </Picker>

            <Text style={styles.label}>Select Crop Type:</Text>
            <Picker
                selectedValue={inputs.cropType}
                onValueChange={(value) => handleChange('cropType', value)}
                style={styles.picker}
            >
                {cropTypes.map((crop) => (
                    <Picker.Item key={crop} label={crop} value={crop} />
                ))}
            </Picker>

            <TextInput
                style={styles.input}
                placeholder="Nitrogen (N)"
                value={inputs.nitrogen}
                onChangeText={(value) => handleChange('nitrogen', value)}
                keyboardType="numeric"
            />

            <TextInput
                style={styles.input}
                placeholder="Potassium (K)"
                value={inputs.potassium}
                onChangeText={(value) => handleChange('potassium', value)}
                keyboardType="numeric"
            />

            <TextInput
                style={styles.input}
                placeholder="Phosphorous (P)"
                value={inputs.phosphorous}
                onChangeText={(value) => handleChange('phosphorous', value)}
                keyboardType="numeric"
            />

            <Button title="Submit" onPress={handleSubmit} />

            {recommendedFertilizer && (
                <Text style={styles.result}>Recommended Fertilizer: {recommendedFertilizer}</Text>
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

export default FertilizerRecommendationScreen;
