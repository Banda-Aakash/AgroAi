import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
const features = [
    {
      name: 'Market Access',
      image: require('../assets/market-access.png'),
      description: 'Connect with buyers and sellers easily.',
      screen: 'MarketAccess', // Add screen name for navigation
    },
    {
      name: 'Chatbot',
      image: require('../assets/chatbot.png'),
      description: 'Get instant answers to your queries.',
      screen: 'Chatbot', // Add screen name for navigation
    },
    {
      name: 'Task Manager',
      image: require('../assets/task-manager.png'),
      description: 'Manage daily farming activities efficiently.',
      screen: 'TaskManager', // Add screen name for navigation
    },
    {
      name: 'News',
      image: require('../assets/news-api.png'),
      description: 'Stay updated with agricultural news.',
      screen: 'News', // Add screen name for navigation
    },
    {
      name: 'Weather Forecast',
      image: require('../assets/weather.png'),
      description: 'Plan farming with real-time weather updates.',
      screen: 'Weather', // Add screen name for navigation
    },
    {
      name: 'Yield Prediction',
      image: require('../assets/yield-prediction.png'),
      description: 'Estimate crop yields based on data.',
      screen: 'YieldPrediction', // Add screen name for navigation
    },
    {
      name: 'Rainfall Prediction',
      image: require('../assets/rainfall.jpg'),
      description: 'Predict rainfall for better planning.',
      screen: 'RainfallPrediction', // Add screen name for navigation
    },
    {
      name: 'Fertilizer Recommendation',
      image: require('../assets/fertilizer.png'),
      description: 'Get personalized fertilizer suggestions.',
      screen: 'FertilizerRecommendation', // Add screen name for navigation
    },
    {
      name: 'Crop Recommendation',
      image: require('../assets/crop-recommendation.png'),
      description: 'Find the best crops for your soil.',
      screen: 'CropRecommendation', // Add screen name for navigation
    },
    {
      name: 'Crop Prediction',
      image: require('../assets/crop-prediction.jpg'),
      description: 'Use AI to predict the best crops to grow.',
      screen: 'CropPrediction', // Add screen name for navigation
    },
  ];

const HomeScreen = () => {
    const navigation = useNavigation(); // Access navigation

  const handleNavigate = (screenName: string) => {
    navigation.navigate(screenName); // Navigate to the selected feature screen
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* <Image source={require('../assets/Header.png')} style={styles.himg}></Image> */}
      <ImageBackground
        source={require('../assets/Header.png')}
        style={styles.backgroundImage}>
        <Text style={styles.title}>AgroAi</Text>
      </ImageBackground>
      <View style={styles.grid}>
        {features.map((item, index) => (
          <TouchableOpacity key={index} style={styles.card} onPress={() => handleNavigate(item.screen)}>
            <Image source={item.image} style={styles.image} />
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  backgroundImage: {
    width: 360,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },

  //   himg: {
  //     height: 75,
  //     width: 500,
  //     resizeMode: 'contain',
  //   },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop:20,
    marginBottom: 20,
    color: 'green',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    margin: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  image: {
    width: 70,
    height: 70,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
    marginTop: 5,
  },
});

export default HomeScreen;
