import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './index';
import AudioDescription from './AudioDescription';

const Stack = createStackNavigator();

const App: React.FC = () => {
  console.log("App loaded with navigation routes: Home and AudioDescription");
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AudioDescription" component={AudioDescription} options={{ title: 'Audio Description' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
