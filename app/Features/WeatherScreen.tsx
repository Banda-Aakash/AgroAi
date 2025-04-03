import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window'); // Getting screen dimensions

const WeatherScreen = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // WeatherAPI URL
  const apiKey = 'd2ec905e3cb24cd3b4483320250104'; // Replace with your WeatherAPI key
  const apiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`; // URL for weather data

  // Fetch weather data when city is entered
  const fetchWeather = async () => {
    if (!city) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (response.ok) {
        setWeatherData(data);
      } else {
        throw new Error(data.error.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching weather data:', err.message || err);
      setError('Enter proper city name.');
    }

    setLoading(false);
  };

  // Weather data rendering
  const renderWeather = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="blue" />;
    }

    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }

    if (!weatherData) return null;

    const { current, location } = weatherData;
    return (
      <View style={styles.weatherInfo}>
        <Text style={styles.cityName}>{location.name}</Text>
        <Text style={styles.temperature}>{current.temp_c}°C</Text>
        <Text style={styles.weatherCondition}>{current.condition.text}</Text>
        <Text style={styles.details}>
          Humidity: {current.humidity}% | Wind Speed: {current.wind_kph} km/h
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather Info</Text>

      {/* City Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter city name"
        value={city}
        onChangeText={setCity}
        onSubmitEditing={fetchWeather}
      />

      <TouchableOpacity style={styles.button} onPress={fetchWeather}>
        <Text style={styles.buttonText}>Get Weather</Text>
      </TouchableOpacity>

      {renderWeather()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.05, // 5% of screen width
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: width * 0.08, // 8% of screen width for title
    fontWeight: 'bold',
    marginBottom: height * 0.02, // 2% of screen height for spacing
    color: '#333',
  },
  input: {
    height: height * 0.05, // 5% of screen height
    borderColor: '#ddd',
    borderWidth: 1,
    width: '80%',
    marginBottom: height * 0.015, // 1.5% of screen height for spacing
    paddingLeft: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#4F8EF7',
    paddingVertical: height * 0.015, // 1.5% of screen height
    paddingHorizontal: width * 0.1, // 10% of screen width
    borderRadius: 5,
    marginBottom: height * 0.02, // 2% of screen height for spacing
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  weatherInfo: {
    alignItems: 'center',
    marginTop: height * 0.02, // 2% of screen height for spacing
  },
  cityName: {
    fontSize: width * 0.1, // 10% of screen width for city name
    fontWeight: 'bold',
    marginBottom: height * 0.01, // 1% of screen height
  },
  temperature: {
    fontSize: width * 0.15, // 15% of screen width for temperature
    fontWeight: 'bold',
    marginBottom: height * 0.01, // 1% of screen height
  },
  weatherCondition: {
    fontSize: width * 0.06, // 6% of screen width for weather condition
    color: '#555',
    marginBottom: height * 0.01, // 1% of screen height
  },
  details: {
    fontSize: width * 0.05, // 5% of screen width for details
    color: '#555',
  },
  errorText: {
    color: 'red',
    fontSize: width * 0.05, // 5% of screen width for error message
  },
});

export default WeatherScreen;
