import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Trails</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Trails</Text>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemTitle}>Mountain Ridge Trail</Text>
          <Text style={styles.itemSubtitle}>5.2 km • Moderate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemTitle}>Forest Loop</Text>
          <Text style={styles.itemSubtitle}>3.8 km • Easy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemTitle}>Summit Challenge</Text>
          <Text style={styles.itemSubtitle}>8.1 km • Difficult</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemTitle}>Hiking</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemTitle}>Biking</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemTitle}>Running</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  item: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
    borderRadius: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});