import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MapView from '../features/mapView';
import { RootStackParamList } from './types';


const Stack = createStackNavigator<RootStackParamList>();

function NavigationStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="MapView"
          component={MapView}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default NavigationStack;