import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Body from '../components/Body';
import { insertPosts } from '../database/insertPosts';
import Header from '../components/Header';

const HomeScreen = () => {
  useEffect(() => {
    console.log('HomeScreen: Calling insertPosts to populate database...');
    insertPosts().catch(error => {
      console.error('HomeScreen: Failed to insert initial posts:', error);
    });
  }, []);

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