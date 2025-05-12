// This is the location screen of the app
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Platform } from 'react-native';
import * as Location from 'expo-location';
import Map from '../../components/map/map';

export default function LocationScreen() {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [loading, setLoading] = useState(false);
    const [MapViewComponent, setMapViewComponent] = useState(null);

    async function getLocation() {
        setLoading(true);
        setErrorMsg(null);

        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Permission to access location was denied');
            }
            let position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
                maximumAge: 10000
            });
            setLocation(position);

            // Dynamically import MapView only on native
            if (Platform.OS !== 'web' && !MapViewComponent) {
                const { default: MapView, Marker } = await import('react-native-maps');
                setMapViewComponent(() => ({ MapView, Marker }));
            }
        } catch (error) {
            setErrorMsg(`Error: ${error.message || "Failed to get location"}`);
        } finally {
            setLoading(false);
        }
    }

    let locationText = 'Tap the button to get your location';
    if (errorMsg) {
        locationText = errorMsg;
    } else if (location) {
        locationText = `Latitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}`;
        if (location.coords.altitude) {
            locationText += `\nAltitude: ${location.coords.altitude} meters`;
        }
        if (location.coords.speed) {
            locationText += `\nSpeed: ${location.coords.speed} m/s`;
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Location Screen</Text>
            <Text style={styles.description}>This is the location screen where you can view your current location.</Text>
            <View style={styles.locationContainer}>
                <Text style={styles.locationText}>{locationText}</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />
                ) : (
                    <Button title="Get My Location" onPress={getLocation} />
                )}
            </View>
            {location && (
                <Map
                    latitude={location.coords.latitude}
                    longitude={location.coords.longitude}
                    markerTitle="You are here"
                    style={styles.map}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
    },
    locationContainer: {
        width: '100%',
        padding: 20,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        alignItems: 'center',
    },
    locationText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    loader: {
        marginTop: 10,
    },
    map: {
        width: '100%',
        height: 300,
        marginTop: 20,
        borderRadius: 10,
        border: '1px solid red',
    }
});