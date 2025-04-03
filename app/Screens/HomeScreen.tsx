import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// Get screen width and height for responsive design
const { width, height } = Dimensions.get("window");

// Utility functions for responsive units
const wp = (percentage) => (width * percentage) / 100; // Responsive width
const hp = (percentage) => (height * percentage) / 100; // Responsive height

const features = [
  {
    name: "Market Access",
    image: require("../assets/market-access.png"),
    description: "Connect with buyers and sellers easily.",
    screen: "MarketAccess",
  },
  {
    name: "Chatbot",
    image: require("../assets/chatbot.png"),
    description: "Get instant answers to your queries.",
    screen: "Chatbot",
  },
  {
    name: "Task Manager",
    image: require("../assets/task-manager.png"),
    description: "Manage daily farming activities efficiently.",
    screen: "TaskManager",
  },
  {
    name: "News",
    image: require("../assets/news-api.png"),
    description: "Stay updated with agricultural news.",
    screen: "News",
  },
  {
    name: "Weather Forecast",
    image: require("../assets/weather.png"),
    description: "Plan farming with real-time weather updates.",
    screen: "Weather",
  },
  {
    name: "Yield Prediction",
    image: require("../assets/yield-prediction.png"),
    description: "Estimate crop yields based on data.",
    screen: "YieldPrediction",
  },
  // {
  //   name: "Rainfall Prediction",
  //   image: require("../assets/rainfall.jpg"),
  //   description: "Predict rainfall for better planning.",
  //   screen: "RainfallPrediction",
  // },
  {
    name: "Fertilizer Recommendation",
    image: require("../assets/fertilizer.png"),
    description: "Get personalized fertilizer suggestions.",
    screen: "FertilizerRecommendation",
  },
  {
    name: "Crop Recommendation",
    image: require("../assets/crop-recommendation.png"),
    description: "Find the best crops for your soil.",
    screen: "CropRecommendation",
  },
  // {
  //   name: "Crop Prediction",
  //   image: require("../assets/crop-prediction.jpg"),
  //   description: "Use AI to predict the best crops to grow.",
  //   screen: "CropPrediction",
  // },
];

const HomeScreen = () => {
  const navigation = useNavigation();

  const handleNavigate = (screenName: string) => {
    navigation.navigate(screenName);
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../assets/Header.png")}
        style={styles.backgroundImage}
      >
        <Text style={styles.title}>AgroAi</Text>
      </ImageBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.grid}>
          {features.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => handleNavigate(item.screen)}
            >
              <Image source={item.image} style={styles.image} />
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    paddingLeft: wp(5),
    paddingRight: wp(5),
    paddingBottom: hp(3),
    alignItems: "center",
  },
  backgroundImage: {
    width: "100%", // Adjusting for responsive width
    height: hp(10), // 10% of screen height
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: wp(6), // 6% of screen width for title font size
    fontWeight: "bold",
    marginTop: hp(2),
    marginBottom: hp(2),
    color: "green",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "white",
    padding: wp(4), // 4% of screen width for padding
    margin: wp(2), // 2% of screen width for margin
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "45%", // 45% of screen width for card width
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  image: {
    width: wp(15), // 15% of screen width for image size
    height: wp(15), // 15% of screen width for image height
    marginBottom: hp(2), // 2% of screen height for margin
  },
  cardTitle: {
    fontSize: wp(4), // 4% of screen width for title font size
    fontWeight: "bold",
    textAlign: "center",
  },
  cardDescription: {
    fontSize: wp(3.5), // 3.5% of screen width for description font size
    textAlign: "center",
    color: "#666",
    marginTop: hp(1), // 1% of screen height for margin
  },
});

export default HomeScreen;
