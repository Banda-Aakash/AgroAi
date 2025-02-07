// NewsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";

const NewsScreen = () => {
  const [articles, setArticles] = useState<any[]>([]); // For holding news articles
  const [loading, setLoading] = useState<boolean>(true); // To handle loading state
  const [error, setError] = useState<string | null>(null); // To handle error state

  // News API URL (replace `YOUR_API_KEY` with your actual NewsAPI key)
  const apiUrl = `https://newsapi.org/v2/everything?q=agriculture+crop&apiKey=587bb475307d41628c350a8898eda38f`;

  // Fetch the news articles when the component mounts
  useEffect(() => {
    axios
      .get(apiUrl)
      .then((response) => {
        setArticles(response.data.articles);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch news");
        setLoading(false);
      });
  }, []);

  // Render each news article
  const renderArticle = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => alert(item.title)}>
      <Image source={{ uri: item.urlToImage }} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity>
      </TouchableOpacity>
      <Text style={styles.heading}>Latest News</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={articles}
          renderItem={renderArticle}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    padding: 10,
    backgroundColor: "white",
  },
  heading: {
    fontSize: 25,
    fontWeight: "bold",
    color:"green",
  },
  card: {
    backgroundColor: "#fff",
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});

export default NewsScreen;
