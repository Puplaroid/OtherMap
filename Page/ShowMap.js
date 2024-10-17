import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Alert,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function ShowMap({ route, navigation }) {
  const { selectedCanteen } = route.params || {}; // Get selected canteen from route
  const mapRef = useRef(null);
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoSWQiOiJyZXF1ZXN0ZXIxMjMiLCJpYXQiOjE3MjkxNjczMTAsImV4cCI6MTczNzgwNzMxMH0.w3BtSKveD3tsK4CIamsQjco9AVZnTE_1vq85pe-zd9Y';

  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(selectedCanteen || null); // Set initial marker if passed

  useEffect(() => {
    const fetchCanteensData = async () => {
      try {
        const headersList = {
          Accept: '*/*',
          Authorization: `Bearer ${token}`,
        };
        const response = await fetch(
          'https://ku-man-api.vimforlanie.com/canteen',
          { method: 'GET', headers: headersList }
        );

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const validCanteens = data.filter(
          (canteen) => canteen.latitude !== 0 && canteen.longitude !== 0
        );
        setCanteens(validCanteens);
      } catch (error) {
        console.error('Error fetching canteens data:', error);
        setError(error.message);
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCanteensData();
  }, []);

  const getInitialRegion = () => {
    if (selectedMarker) {
      return {
        latitude: selectedMarker.latitude,
        longitude: selectedMarker.longitude,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      };
    }
    return {
      latitude: 13.846322,
      longitude: 100.569696,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  };

  const handleMarkerPress = (canteen) => {
    setSelectedMarker(canteen); // Set selected marker when a marker is pressed
  };

  const handleSelectCanteen = () => {
    if (selectedMarker) {
      navigation.navigate('CanteenDetails', { canteen: selectedMarker }); // Navigate to canteen details
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={getInitialRegion()} // Use computed initial region
      >
        {canteens.map((canteen) => (
          <Marker
            key={canteen.canteenId}
            coordinate={{
              latitude: canteen.latitude,
              longitude: canteen.longitude,
            }}
            title={canteen.name}
            description={`Canteen ID: ${canteen.canteenId}`}
            image={require('./../assets/Marker.png')}
            onPress={() => handleMarkerPress(canteen)}
          />
        ))}
      </MapView>

      {selectedMarker && (
        <View style={styles.bottomBar}>
          <Text style={styles.canteenName}>โรงอาหาร {selectedMarker.name}</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={handleSelectCanteen}
          >
            <Text style={styles.buttonText}>เลือกโรงอาหารนี้</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: { color: 'red', fontSize: 16 },
  map: { width: '100%', height: '100%' },
  bottomBar: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
  },
  canteenName: { fontSize: 18, marginBottom: 8 },
  selectButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontSize: 16 },
});
