import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    TextInput,
    FlatList,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Button,
} from 'react-native';

export default function SearchCanteen({ navigation }) {
    const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoSWQiOiJyZXF1ZXN0ZXIxMjMiLCJpYXQiOjE3MjkxNjczMTAsImV4cCI6MTczNzgwNzMxMH0.w3BtSKveD3tsK4CIamsQjco9AVZnTE_1vq85pe-zd9Y';

    const [searchQuery, setSearchQuery] = useState('');
    const [canteens, setCanteens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch canteen data from API
    const fetchCanteensData = useCallback(async () => {
        setLoading(true); // Show loading indicator
        try {
            const headersList = {
                Accept: '*/*',
                Authorization: `Bearer ${token}`,
            };

            const response = await fetch(
                'https://ku-man-api.vimforlanie.com/canteen',
                {
                    method: 'GET',
                    headers: headersList,
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

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
            setRefreshing(false); // Stop refreshing indicator
        }
    }, [token]);

    // Fetch canteens on component mount
    useEffect(() => {
        fetchCanteensData();
    }, [fetchCanteensData]);

    // Filter canteens based on search query
    const filteredCanteens = canteens.filter((canteen) =>
        canteen.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle refreshing the list
    const onRefresh = () => {
        setRefreshing(true);
        fetchCanteensData();
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
            <TextInput
                placeholder="ค้นหาโรงอาหาร"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <View style={styles.buttonContainer}>
                <Button
                    title="ดูแผนที่"
                    onPress={() => navigation.navigate('ShowMap', { canteens })}
                />
            </View>
            {filteredCanteens.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>ไม่พบโรงอาหารที่ตรงกับการค้นหา</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredCanteens}
                    keyExtractor={(item) => item.canteenId.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.canteenItem}
                            onPress={() =>
                                navigation.navigate('ShowMap', {
                                    selectedCanteen: item,
                                })
                            }
                        >
                            <Text>{item.name}</Text>
                        </TouchableOpacity>

                    )}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    searchInput: {
        borderWidth: 1,
        padding: 8,
        marginBottom: 12,
        borderRadius: 8,
    },
    buttonContainer: {
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden',
    },
    canteenItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: { fontSize: 18, color: '#999' },
});


