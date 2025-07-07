import { TextInput, View, StyleSheet } from 'react-native';
export default function SearchBar({ placeholder, onSearch }) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        onChangeText={onSearch}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    margin: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
  },
  input: {
    height: 40,
    fontSize: 16,
  },
});