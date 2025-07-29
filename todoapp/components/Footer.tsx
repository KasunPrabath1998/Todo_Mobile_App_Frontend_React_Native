import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter, Href } from 'expo-router';

const Footer = () => {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePress = (index: number, route: string) => {
    setSelectedIndex(index);
    router.push(route as Href<string>);
  };

  const getIconStyle = (index: number) => {
    const scale = new Animated.Value(1);

    if (index === selectedIndex) {
      Animated.spring(scale, {
        toValue: 1.2,
        friction: 3,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }

    return { transform: [{ scale }] };
  };

  const getIconColor = (index: number) => {
    return index === selectedIndex ? '#FFD700' : '#fff';
  };

  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={() => handlePress(0, '/Home')}>
        <Animated.View style={getIconStyle(0)}>
          <Icon name="home" size={32} color={getIconColor(0)} />
        </Animated.View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handlePress(1, '/Showtodos')}>
        <Animated.View style={getIconStyle(1)}>
          <Icon name="tasks" size={28} color={getIconColor(1)} />
        </Animated.View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handlePress(2, '/Calender')}>
        <Animated.View style={getIconStyle(2)}>
          <Icon name="calendar" size={28} color={getIconColor(2)} />
        </Animated.View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handlePress(3, '/Profile')}>
        <Animated.View style={getIconStyle(3)}>
          <Icon name="user" size={28} color={getIconColor(3)} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1D4ED8',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
});

export default Footer;
