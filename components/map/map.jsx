import { useState, useEffect } from 'react';
import { Platform, ActivityIndicator, StyleSheet } from 'react-native';
import * as Location from 'expo-location';

export default function Map({ latitude, longitude, address, markerTitle = "Location", style }) {
    const [coords, setCoords] = useState(
        latitude && longitude ? { latitude, longitude } : null
    );
    const [loading, setLoading] = useState(false);
    const [MapViewComponent, setMapViewComponent] = useState(null);

    useEffect(() => {
        let isMounted = true;
        async function geocode() {
            setLoading(true);
            try {
                console.log('Geocoding address:', address);
                const geocoded = await Location.geocodeAsync(address);
                console.log('Geocoded:', geocoded);
                if (geocoded && geocoded.length > 0 && isMounted) {
                    setCoords({
                        latitude: geocoded[0].latitude,
                        longitude: geocoded[0].longitude,
                    });
                }
            } catch (e) {
                setCoords(null);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        if (address && (!latitude || !longitude)) {
            geocode();
        } else if (latitude && longitude) {
            setCoords({ latitude, longitude });
        }
        return () => { isMounted = false; };
    }, [address, latitude, longitude]);

    useEffect(() => {
        if (Platform.OS !== 'web' && !MapViewComponent) {
            import('react-native-maps').then(({ default: MapView, Marker }) => {
                setMapViewComponent({ MapView, Marker });
            });
        }
    }, [MapViewComponent]);

    if (!coords) {
        if (loading) {
            return <ActivityIndicator size="large" color="#0066cc" style={{ marginTop: 20 }} />;
        }
        return null;
    }

    if (Platform.OS === 'web') {
        return (
            <iframe
                title="Google Maps"
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: 10, marginTop: 20, ...style }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${coords.latitude},${coords.longitude}&z=15&output=embed`}
            />
        );
    }

    if (!MapViewComponent) {
        return <ActivityIndicator size="large" color="#0066cc" style={{ marginTop: 20 }} />;
    }

    const { MapView, Marker } = MapViewComponent;
    return (
        <MapView
            style={[styles.map, style]}
            initialRegion={{
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }}
            region={{
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }}
        >
            <Marker
                coordinate={{ latitude: coords.latitude, longitude: coords.longitude }}
                title={markerTitle}
            />
        </MapView>
    );
}

const styles = StyleSheet.create({
    map: {
        width: '100%',
        height: 300,
        marginTop: 20,
        borderRadius: 10,
    },
});