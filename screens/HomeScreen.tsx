// HomeScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Body from '../components/Body';
import Header from '../components/Header';


const HomeScreen = () => {
 

  return (
    <View style={styles.container}>
      <Header />
      <Body />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default HomeScreen;