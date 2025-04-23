import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Image } from "react-native";

// Import screens
import LoginScreen from "../Screens/LoginScreen";
import SignupScreen from "../Screens/SignupScreen";


import HomeScreen from "../Screens/HomeScreen";
import ProfileScreen from "../Screens/ProfileScreen";
import SettingsScreen from "../Screens/SettingsScreen";
import MarketplaceScreen from "../Screens/MarketplaceScreen";
import CartScreen from "../Screens/CartScreen";
import FarmerNotificationScreen from "../Screens/FarmerNotificationScreen";

// Feature screens
import MarketAccessScreen from "../Features/MarketAccessScreen";
import ChatbotScreen from "../Features/ChatbotScreen";
import TaskManagerScreen from "../Features/TaskManagerScreen";
import NewsScreen from "../Features/NewsScreen";
import WeatherScreen from "../Features/WeatherScreen";
import YieldPredictionScreen from "../Features/YieldPredictionScreen";
import RainfallPredictionScreen from "../Features/RainfallPredictionScreen";
import FertilizerRecommendationScreen from "../Features/FertilizerRecommendationScreen";
import CropRecommendationScreen from "../Features/CropRecommendationScreen";
import CropPredictionScreen from "../Features/CropPredictionScreen";

// Define Stack Navigation for Login & OTP
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Marker: undefined;
  Cart:undefined;
  HomeTabs: undefined;
  MarketAccess: undefined;
  Chatbot: undefined;
  TaskManager: undefined;
  News: undefined;
  Weather: undefined;
  YieldPrediction: undefined;
  RainfallPrediction: undefined;
  FertilizerRecommendation: undefined;
  CropRecommendation: undefined;
  CropPrediction: undefined;
};


const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// HomeTabs (Bottom Tab Navigation)
const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#fff", height: 55 },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../assets/home-icon.png")}
              style={{ width: 24, height: 24 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={FarmerNotificationScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../assets/notification.jpg")}
              style={{ width: 24, height: 24 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../assets/profile-icon.jpg")}
              style={{ width: 24, height: 24 }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Component (WITHOUT NavigationContainer)
const App = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 👇 Auth Screens */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />

      {/* 👇 Home and Feature Screens */}
      <Stack.Screen name="HomeTabs" component={HomeTabs} />
      <Stack.Screen name="MarketAccess" component={MarketAccessScreen} />
      <Stack.Screen name="Chatbot" component={ChatbotScreen} />
      <Stack.Screen name="TaskManager" component={TaskManagerScreen} />
      <Stack.Screen name="News" component={NewsScreen} />
      <Stack.Screen name="Weather" component={WeatherScreen} />
      <Stack.Screen name="YieldPrediction" component={YieldPredictionScreen} />
      <Stack.Screen name="RainfallPrediction" component={RainfallPredictionScreen} />
      <Stack.Screen name="FertilizerRecommendation" component={FertilizerRecommendationScreen} />
      <Stack.Screen name="CropRecommendation" component={CropRecommendationScreen} />
      <Stack.Screen name="CropPrediction" component={CropPredictionScreen} />
    </Stack.Navigator>
  );
};


export default App;
