import React from 'react';
import { View, StyleSheet} from 'react-native';
import { Provider } from 'react-redux';
import { store } from './features/Store';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import Bottom from './components/Bottom';
import HomeScreen from './screens/HomeScreen';
import AddScreen from './screens/AddScreen';
import SearchScreen from './screens/SearchScreen';
import ReelsScreen from './screens/ReelsScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={{ headerShown: false }}
              tabBar={(props) => <Bottom {...props} />}
            >
              <Tab.Screen name="Home" component={HomeScreen} />
              <Tab.Screen name="Search" component={SearchScreen} />
              <Tab.Screen name="Add" component={AddScreen} />
              <Tab.Screen name="Reels" component={ReelsScreen} />
              <Tab.Screen name="Profile" component={ProfileScreen} />
            </Tab.Navigator>
          </NavigationContainer>
        </View>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    paddingBottom: 20,
  
  },
});