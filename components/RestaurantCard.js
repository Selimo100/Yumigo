import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const RestaurantCard = ({ restaurant }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: restaurant.image }} style={styles.image} />
      <Text style={styles.name}>{restaurant.name}</Text>
      <Text style={styles.rating}>Rating: {restaurant.rating}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  rating: {
    fontSize: 14,
    color: '#666',
  },
});

export default RestaurantCard;