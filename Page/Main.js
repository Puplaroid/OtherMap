import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

const Main = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Button
                title="Go to Search Canteen"
                onPress={() => navigation.navigate('SearchCanteen')}
            />
            <Button
                title="Go to Pick Location"
                onPress={() => navigation.navigate('PickLocation')}
            />
            <Button
                title="Go to Order Tracking Map"
                onPress={() => navigation.navigate('OrderTrackingMapBeforeConfirm')}
            />
            <Button
                title="Go to Order Tracking Map To Canteen"
                onPress={() => navigation.navigate('OrderTrackingMapToCanteen')}
            />
            <Button
                title="Go to Order Tracking Map To Destination"
                onPress={() => navigation.navigate('OrderTrackingMapToDestination')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
});

export default Main;
