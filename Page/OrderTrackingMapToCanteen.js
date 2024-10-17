import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GOOGLE_MAPS_APIKEY = "AIzaSyAuAlLDi9owSLpxwyesXWCCegYMe9ttqNs";

export default function OrderTrackingMapToCanteen() {
    const orderId = 30; // Example order ID
    const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoSWQiOiJyZXF1ZXN0ZXIxMjMiLCJpYXQiOjE3MjkxNjczMTAsImV4cCI6MTczNzgwNzMxMH0.w3BtSKveD3tsK4CIamsQjco9AVZnTE_1vq85pe-zd9Y';

    const [currentLocation, setCurrentLocation] = useState(null);
    const [canteen, setCanteen] = useState(null);
    const [canteens, setCanteens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [distance, setDistance] = useState(null);
    const [duration, setDuration] = useState(null);

    // Fetch all canteens
    useEffect(() => {
        const fetchCanteens = async () => {
            try {
                const headers = {
                    Accept: '*/*',
                    Authorization: `Bearer ${token}`,
                };
                const response = await fetch('https://ku-man-api.vimforlanie.com/canteen', {
                    method: 'GET',
                    headers,
                });

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                setCanteens(data);
            } catch (error) {
                Alert.alert('Error', error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCanteens();
    }, [token]);

    // Fetch the order and find the canteen
    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                const headers = {
                    Accept: '*/*',
                    Authorization: `Bearer ${token}`,
                };
                const response = await fetch(
                    `https://ku-man-api.vimforlanie.com/requester/order/info?orderId=${orderId}`,
                    { method: 'GET', headers }
                );

                if (!response.ok) throw new Error('Failed to fetch order data');

                const data = await response.json();
                const selectedCanteen = canteens.find(can => can.canteenId === data.canteenId);
                if (selectedCanteen) {
                    setCanteen(selectedCanteen);
                    console.log('Found Canteen:', selectedCanteen);
                } else {
                    console.log('No matching canteen found.');
                }
            } catch (error) {
                Alert.alert('Error', error.message);
            }
        };

        fetchOrderData();
    }, [canteens, orderId]);

    // Track the walker's current location
    useEffect(() => {
        let locationSubscription;

        const startLocationTracking = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Allow location access to proceed');
                return;
            }

            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 1000, // Update every second
                    distanceInterval: 1, // Update for every 1 meter movement
                },
                (location) => {
                    setCurrentLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    });
                    console.log('Updated Current Location:', location.coords);
                }
            );
        };

        startLocationTracking();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 13.846322, // Default map center (Kasetsart University)
                    longitude: 100.569696,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                {/* Walker's Current Location Marker */}
                {currentLocation && (
                    <Marker coordinate={currentLocation} title="Walker">
                        <Image
                            source={require("./../assets/walk.png")}
                            style={styles.marker}
                        />
                    </Marker>
                )}

                {/* Canteen Marker */}
                {canteen && (
                    <Marker
                        coordinate={{
                            latitude: canteen.latitude,
                            longitude: canteen.longitude,
                        }}
                        title={canteen.name}
                        description="Canteen"
                    >
                    <Image
                            source={require("./../assets/canteen.png")}
                            style={styles.marker}
                        />
                    </Marker>
                )}

                {/* Route from Walker's Current Location to Canteen */}
                {currentLocation && canteen && (
                    <MapViewDirections
                        origin={currentLocation}
                        destination={{
                            latitude: canteen.latitude,
                            longitude: canteen.longitude,
                        }}
                        apikey={GOOGLE_MAPS_APIKEY}
                        strokeWidth={3}
                        strokeColor="blue"
                        mode="WALKING"
                        onReady={(result) => {
                            console.log('Walker to Canteen - Distance:', result.distance, 'Duration:', result.duration);
                            setDistance(result.distance);
                            setDuration(result.duration);
                        }}
                        onError={(error) => console.log('Error with walker-canteen directions:', error)}
                    />
                )}
            </MapView>

            {/* Distance and Duration Info */}
            <View style={styles.infoBox}>
                <Text>ระยะทางรวม: {distance?.toFixed(2)} กิโลเมตร</Text>
                <Text>ระยะเวลาที่ใช้โดยประมาณ: {duration?.toFixed(2)} นาที</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    map: { width: '100%', height: '100%' },
    marker: { width: 30, height: 30, resizeMode: 'contain' },
    infoBox: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        margin: 16,
        elevation: 5,
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
    },
});
