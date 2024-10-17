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

export default function OrderTrackingMapToDestination() {
    const orderId = 30; // Example order ID
    const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoSWQiOiJyZXF1ZXN0ZXIxMjMiLCJpYXQiOjE3MjkxNjczMTAsImV4cCI6MTczNzgwNzMxMH0.w3BtSKveD3tsK4CIamsQjco9AVZnTE_1vq85pe-zd9Y';

    const [currentLocation, setCurrentLocation] = useState(null);
    const [destination, setDestination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [distance, setDistance] = useState(null);
    const [duration, setDuration] = useState(null);
    const [addressId, setAddressId] = useState(null);

    // Fetch order info to get the destination address ID
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
                setAddressId(data.addressId);
                console.log('Order Address ID:', data.addressId);
            } catch (error) {
                Alert.alert('Error', error.message);
            }
        };

        fetchOrderData();
    }, [orderId]);

    // Fetch destination address info using the address ID
    useEffect(() => {
        if (!addressId) return;

        const fetchDestination = async () => {
            try {
                const headers = {
                    Accept: '*/*',
                    Authorization: `Bearer ${token}`,
                };

                const response = await fetch(
                    `https://ku-man-api.vimforlanie.com/requester/address/info?addressId=${addressId}`,
                    { method: 'GET', headers }
                );

                if (!response.ok) throw new Error('Failed to fetch address data');

                const data = await response.json();
                console.log('Fetched Address Data:', data);

                if (data.latitude && data.longitude) {
                    setDestination({
                        latitude: data.latitude,
                        longitude: data.longitude,
                    });
                }
            } catch (error) {
                Alert.alert('Error', error.message);
            }
            finally {
                setLoading(false);
            }
        };

        fetchDestination();
    }, [addressId]);

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
                    distanceInterval: 1, // Update every meter traveled
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

                {/* Destination Marker */}
                {destination && (
                    <Marker
                        coordinate={destination}
                        title="Destination"
                        description="Delivery Address"
                        image={require("./../assets/Marker.png")}
                        style={styles.marker}
                    />
                )}

                {/* Route from Walker's Current Location to Destination */}
                {currentLocation && destination && (
                    <MapViewDirections
                        origin={currentLocation}
                        destination={destination}
                        apikey={GOOGLE_MAPS_APIKEY}
                        strokeWidth={3}
                        strokeColor="blue"
                        mode="WALKING"
                        onReady={(result) => {
                            console.log(
                                'Walker to Destination - Distance:',
                                result.distance,
                                'Duration:',
                                result.duration
                            );
                            setDistance(result.distance);
                            setDuration(result.duration);
                        }}
                        onError={(error) =>
                            console.log('Error with walker-destination directions:', error)
                        }
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
