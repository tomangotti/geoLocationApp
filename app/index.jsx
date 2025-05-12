import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to GeoLocation App</Text>
      
      <View style={styles.linkContainer}>
        <Link href="/location" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>View Location</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/profile" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>View Profile</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/routes" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>View Routes</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  linkContainer: {
    width: '100%',
    gap: 20,
  },
  button: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});