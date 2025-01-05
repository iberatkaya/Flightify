import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView from 'react-native-maps';
import { MapViewNavigationProp } from './types';

function MapScreen() {
  const navigation = useNavigation<MapViewNavigationProp>();

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 39.8283, 
          longitude: -98.5795,
          latitudeDelta: 60, 
          longitudeDelta: 60,
        }}
        mapType='satelliteFlyover'
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default MapScreen;