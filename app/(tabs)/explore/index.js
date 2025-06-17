import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native"

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Explore</Text>
    
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Locations</Text>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemTitle}>National Park</Text>
          <Text style={styles.itemSubtitle}>Beautiful landscapes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemTitle}>Forest Reserve</Text>
          <Text style={styles.itemSubtitle}>Wildlife sanctuary</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemTitle}>Lake District</Text>
          <Text style={styles.itemSubtitle}>Water activities</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activities</Text>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemTitle}>Photography</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemTitle}>Camping</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemTitle}>Bird Watching</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemTitle}>Rock Climbing</Text>
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