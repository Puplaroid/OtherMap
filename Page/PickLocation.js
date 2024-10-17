import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    Switch,
} from 'react-native';
import MapView from 'react-native-maps';

export default function PickLocation({ navigation }) {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoSWQiOiJyZXF1ZXN0ZXIxMjMiLCJpYXQiOjE3MjkxNzEzMjUsImV4cCI6MTczNzgxMTMyNX0.OhZCIjQfBU52uWs_JEb6WI5mIlep48jX1F3W0tIQbM4";

    const [name, setName] = useState('');
    const [detail, setDetail] = useState('');
    const [note, setNote] = useState('');
    const [isDefault, setIsDefault] = useState(false); // Track the switch state
    const [region, setRegion] = useState({
        latitude: 13.846322,
        longitude: 100.569696,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    const handleSubmit = async () => {
        if (!name) {
            Alert.alert("Error", "Please provide a name.");
            return;
        }

        const headersList = {
            Accept: "*/*",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };

        const addressData = {
            name,
            detail,
            note,
            latitude: region.latitude,
            longitude: region.longitude,
            default: isDefault,
        };

        try {
            console.log(addressData);
            console.log(JSON.stringify(addressData));
            const response = await fetch(
                "https://ku-man-api.vimforlanie.com/requester/create-address",
                {
                    method: "POST",
                    body: JSON.stringify(addressData),
                    headers: headersList,
                }
            );

            const data = await response.json();
            if (response.ok) {
                Alert.alert("Success", "Address created successfully.");
                navigation.goBack();
            } else {
                Alert.alert("Error", data.message || "Failed to create address.");
            }
        } catch (error) {
            Alert.alert("Error", "Network error occurred.");
        }
    };

    const handleRegionChangeComplete = (newRegion) => {
        setRegion(newRegion);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.label}>Name (Required)</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter name"
                value={name}
                onChangeText={setName}
            />

            <Text style={styles.label}>Detail (Optional)</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter detail"
                value={detail}
                onChangeText={setDetail}
            />

            <Text style={styles.label}>Note (Optional)</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter note"
                value={note}
                onChangeText={setNote}
            />

            {/* Switch for Default Address */}
            <View style={styles.switchContainer}>
                <Text style={styles.label}>Set as default address</Text>
                <Switch
                    value={isDefault}
                    onValueChange={setIsDefault}
                />
            </View>

            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    initialRegion={region}
                    onRegionChangeComplete={handleRegionChangeComplete}
                />
                <View style={styles.markerFixed}>
                    <Text style={styles.marker}>📍</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    mapContainer: {
        height: 300,
        marginBottom: 16,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerFixed: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -12,
        marginTop: -24,
    },
    marker: {
        fontSize: 24,
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});
