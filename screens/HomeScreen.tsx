import React from 'react';
import { View } from 'react-native';
import Header from '../components/Header';
import Body from '../components/Body';

const HomeScreen = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />
      <Body />
    </View>
  );
};
export default HomeScreen;
