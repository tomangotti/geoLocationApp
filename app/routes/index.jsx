import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform , ScrollView} from 'react-native';
import * as Location from 'expo-location';
import routeData from './routes.data.json';
import { Link } from 'expo-router';
import Map from '../../components/map/map';

export default function Routes() {
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [MapViewComponent, setMapViewComponent] = useState(null);
    const [coords, setCoords] = useState(null);

    const handleRouteSelect = async (route) => {
        setSelectedRoute(route);
        setCoords(null);

        // Geocode address to get coordinates
        try {
            const geocoded = await Location.geocodeAsync(route.address);
            if (geocoded && geocoded.length > 0) {
                setCoords({
                    latitude: geocoded[0].latitude,
                    longitude: geocoded[0].longitude,
                });
            }
        } catch (e) {
            setCoords(null);
        }

        // Dynamically import MapView only on native
        if (Platform.OS !== 'web' && !MapViewComponent) {
            const { default: MapView, Marker } = await import('react-native-maps');
            setMapViewComponent({ MapView, Marker });
        }
    };

    const routesCards = routeData.map((route, index) => (
        <TouchableOpacity key={index} style={styles.card} onPress={() => handleRouteSelect(route)}>
            <Text style={styles.cardTitle}>{route.name}</Text>
            <Text style={styles.cardDescription}>{route.address}</Text>
        </TouchableOpacity>
    ));

    const renderRouteDetails = () => {
        if (selectedRoute) {
            return (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{selectedRoute.name}</Text>
                    <Text style={styles.cardDescription}>{selectedRoute.address}</Text>
                    <Map
                        address={selectedRoute.address}
                        markerTitle={selectedRoute.name}
                        style={styles.map}
                    />
                    <Link href={`/trip/${selectedRoute.id}`} asChild>
                        <TouchableOpacity style={{ marginTop: 20, padding: 10, backgroundColor: '#f4511e', borderRadius: 5 }}>
                            <Text style={{ color: 'white', textAlign: 'center' }}>Start Trip</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            );
        }
        return null;
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ padding: 20 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 20 }}>Welcome to the GeoLocation App</Text>
            {selectedRoute ? renderRouteDetails() :
                <Text style={{ fontSize: 16, marginTop: 20 }}>Select a route to see details</Text>
            }
            <Text style={{ fontSize: 16, marginTop: 20 }}>Available Routes:</Text>
            <View style={styles.routesContainer}>
                {routesCards}
            </View>
        </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "85%",
        backgroundColor: '#fff',
        padding: 20,
        margin: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardDescription: {
        fontSize: 14,
        marginTop: 10,
    },
    routesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    map: {
        width: '100%',
        height: 300,
        marginTop: 20,
        borderRadius: 10,
    },
});