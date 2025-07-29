import { Stack, useSegments } from 'expo-router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';

export default function Layout() {
  const segments = useSegments();
  const currentRoute = segments[0];

  // Determine whether to show Header and Footer
  const showHeader = ['Home', 'Calender' , 'Showtodos'].includes(currentRoute);
  const showFooter = [ 'Profile', 'Calender','Home', 'Showtodos'].includes(currentRoute);

  // Only show Header and Footer if currentRoute is valid (not empty)
  const shouldShowHeaderFooter = currentRoute && (showHeader || showFooter);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Conditionally render Header */}
      {shouldShowHeaderFooter && showHeader && <Header />}
      <Stack />
      {/* Conditionally render Footer */}
      {shouldShowHeaderFooter && showFooter && <Footer />}
    </SafeAreaView>
  );
}
