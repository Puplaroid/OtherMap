import React, { useEffect, useState, useCallback } from 'react';
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

export default function OrderTrackingMapBeforeConfirm() {
    console.log('========================OrderTrackingMap=====================');
    const orderId = 30; // Example order ID
    const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoSWQiOiJyZXF1ZXN0ZXIxMjMiLCJpYXQiOjE3MjkxNjczMTAsImV4cCI6MTczNzgwNzMxMH0.w3BtSKveD3tsK4CIamsQjco9AVZnTE_1vq85pe-zd9Y';

    const [currentLocation, setCurrentLocation] = useState(null);
    const [destination, setDestination] = useState(null);
    const [canteen, setCanteen] = useState(null);
    const [canteens, setCanteens] = useState([]); // Store all canteens
    const [loading, setLoading] = useState(true);
    const [distance, setDistance] = useState(null);
    const [duration, setDuration] = useState(null);
    const [addressId, setAddressId] = useState(null);

    useEffect(() => {
        const fetchCanteens = async () => {
            try {
                const headersList = {
                    Accept: '*/*',
                    Authorization: `Bearer ${token}`,
                };

                console.log("Fetching canteen data...");
                const response = await fetch(
                    'https://ku-man-api.vimforlanie.com/canteen',
                    { method: 'GET', headers: headersList }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                setCanteens(data);
            } catch (error) {
                console.error("Error fetching canteen data:", error);
                setError(error.message);
                Alert.alert('Error', error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCanteens(); // Call fetch function on component mount
    }, [token]); // Run this effect when the token changes

    // Fetch order info and destination
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
                console.log('address Order Data:', data.addressId);

                // Find the canteen matching the order's canteenId
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
    useEffect(() => {
        if (!addressId) return;

        const fetchData = async () => {
            try {
                setLoading(true); // Show loading indicator

                const headersList = {
                    Accept: "*/*",
                    Authorization: `Bearer ${token}`,
                };

                const response = await fetch(
                    `https://ku-man-api.vimforlanie.com/requester/address/info?addressId=${addressId}`,
                    {
                        method: "GET",
                        headers: headersList,
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await response.json();
                    console.log('Fetched Address Data:', data);

                    if (data.latitude && data.longitude) {
                        setDestination({
                            latitude: data.latitude,
                            longitude: data.longitude,
                        });
                    }
                } else {
                    throw new Error(`Unexpected content-type: ${contentType}`);
                }
            } catch (error) {
                console.error("Error fetching address data:", error);
                setError(error.message);
                Alert.alert("Error", error.message);
            } finally {
                setLoading(false); // Hide loading indicator
            }
        };

        fetchData(); // Call fetch function on mount
    }, [addressId]); // Ensure this useEffect depends on addressId



    // Get current location of the walker
    useEffect(() => {
        const getLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Allow location access to proceed');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setCurrentLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            });
            setLoading(false);
        };

        getLocation();
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
                        pinColor="orange"
                    />
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

                {/* Route from Canteen to Destination */}
                {canteen && destination && (
                    <MapViewDirections
                        origin={{
                            latitude: canteen.latitude,
                            longitude: canteen.longitude,
                        }}
                        destination={destination}
                        apikey={GOOGLE_MAPS_APIKEY}
                        strokeWidth={3}
                        strokeColor="red"
                        mode="WALKING"
                        onReady={(result) => {
                            console.log('Canteen to Destination - Distance:', result.distance, 'Duration:', result.duration);
                            setDistance((prev) => prev + result.distance); // Add to previous distance
                            setDuration((prev) => prev + result.duration); // Add to previous duration
                        }}
                        onError={(error) => console.log('Error with canteen-destination directions:', error)}
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
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    marker: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
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
