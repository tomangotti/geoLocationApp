import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import routeData from '../routes/routes.data.json';
import * as Location from 'expo-location';
import {GOOGLE_MAPS_APIKEY} from '@env';


export default function TripScreen() {
    const { id } = useLocalSearchParams();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(false);
    const [MapViewComponent, setMapViewComponent] = useState(null);
    const [coords, setCoords] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [directionsSteps, setDirectionsSteps] = useState([]);

    useEffect(() => {
        async function fetchTripAndLocation() {
            setLoading(true);
            try {
                const tripData = routeData.find((trip) => trip.id.toString() === id);
                setTrip(tripData);

                if (tripData && tripData.address) {
                    const geocoded = await Location.geocodeAsync(tripData.address);
                    if (geocoded && geocoded.length > 0) {
                        setCoords({
                            latitude: geocoded[0].latitude,
                            longitude: geocoded[0].longitude,
                        });
                    }
                }

                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const location = await Location.getCurrentPositionAsync({});
                    setCurrentLocation(location.coords);
                }
            } catch (error) {
                console.error('Error fetching trip or location:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchTripAndLocation();
    }, [id]);

    useEffect(() => {
        if (Platform.OS !== 'web' && !MapViewComponent) {
            Promise.all([
                import('react-native-maps'),
                import('react-native-maps-directions'),
            ]).then(([maps, directions]) => {
                setMapViewComponent({
                    MapView: maps.default,
                    Marker: maps.Marker,
                    MapViewDirections: directions.default,
                });
            });
        }
    }, [MapViewComponent]);

    if (loading) {
        return <ActivityIndicator size="large" color="#0066cc" />;
    }

    if (!trip) {
        return <Text>No trip found</Text>;
    }

    const { MapView, Marker, MapViewDirections } = MapViewComponent || {};

    return (
        <ScrollView style={{ flex: 1 }}>
        <View style={styles.container}>
            <Text style={styles.title}>{trip.name}</Text>
            <Text style={styles.description}>{trip.address}</Text>
            {MapView && coords && currentLocation && (
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >
                    <Marker
                        coordinate={{ latitude: coords.latitude, longitude: coords.longitude }}
                        title={trip.name}
                        description={trip.address}
                    />
                    <Marker
                        coordinate={{
                            latitude: currentLocation.latitude,
                            longitude: currentLocation.longitude,
                        }}
                        title="You"
                        pinColor="blue"
                    />
                    <MapViewDirections
                        origin={currentLocation}
                        destination={coords}
                        apikey={GOOGLE_MAPS_APIKEY}
                        strokeWidth={4}
                        strokeColor="hotpink"
                        onReady={result => {
                            setDirectionsSteps(result.legs[0]?.steps || []);
                        }}
                        onError={e => {
                            console.warn('Directions error:', e);
                        }}
                    />
                </MapView>
            )}
            {/* Directions List */}
            {directionsSteps.length > 0 && (
                <View style={{ marginTop: 20 }}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Directions:</Text>
                    {directionsSteps.map((step, idx) => (
                        <Text key={idx} style={{ marginBottom: 5 }}>
                            {step.html_instructions
                                ? step.html_instructions.replace(/<[^>]+>/g, '')
                                : step.instructions || JSON.stringify(step)}
                        </Text>
                    ))}
                </View>
            )}
        </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        marginBottom: 20,
    },
    map: {
        width: '100%',
        height: 300,
        borderRadius: 10,
    },
});