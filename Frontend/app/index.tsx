import React from 'react';
import { Text, View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter , useNavigation} from 'expo-router';


export default function WelcomeScreen() {
  const router = useRouter();
    // Hide the header for this screen
    const navigation = useNavigation();
    React.useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: false,
      });
    }, [navigation]);
    
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/a.webp')} 
        style={styles.logo}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('./LoginScreen')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  logo: {
    width: 400,
    height: 400,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});
