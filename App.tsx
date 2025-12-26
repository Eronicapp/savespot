import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, FlatList, Linking, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

type RootStackParamList = {
  Home: undefined;
  AddDestination: undefined;
  SavedDestinations: undefined;
};

// Dummy saved destinations for testing
const DUMMY_DESTINATIONS = [
  {
    id: '1',
    name: 'Boston Logan International Airport',
    address: 'East Boston, MA 02128, USA',
    latitude: 42.3656,
    longitude: -71.0096,
  },
  {
    id: '2',
    name: 'Dollar Tree',
    address: '123 Main St, Boston, MA',
    latitude: 42.3601,
    longitude: -71.0589,
  },
  {
    id: '3',
    name: 'Local Gym',
    address: '456 Fitness Ave, Boston, MA',
    latitude: 42.3505,
    longitude: -71.0765,
  },
];

const Stack = createNativeStackNavigator<RootStackParamList>();

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Savespot</Text>
      <Text style={styles.subtitle}>Quick access to your favorite places</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('AddDestination')}
        >
          <Text style={styles.primaryButtonText}>+ Add Destination</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('SavedDestinations')}
        >
          <Text style={styles.secondaryButtonText}>View Saved Destinations</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AddDestinationScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'AddDestination'>) {
  const [selectedLocation, setSelectedLocation] = React.useState<{
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const mapRef = React.useRef<any>(null);

  const handlePlaceSelect = (data: any, details: any) => {
    if (details) {
      const location = {
        name: details.name || data.description,
        address: details.formatted_address || data.description,
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      };
      
      setSelectedLocation(location);
      
      // Move map to selected location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
      
      setShowConfirmDialog(true);
    }
  };

  const handleSaveDestination = () => {
    if (selectedLocation) {
      // TODO: Save to database
      console.log('Saving destination:', selectedLocation);
      Alert.alert('Success', `Destination "${selectedLocation.name}" saved!`);
      setShowConfirmDialog(false);
      navigation.goBack();
    }
  };

  return (
    <View style={styles.mapContainer}>
      {/* Google Places Autocomplete */}
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          placeholder="Search for a place..."
          fetchDetails={true}
          onPress={handlePlaceSelect}
          query={{
            key: 'AIzaSyCT94wYCVyggiHgKjnlX4mI2PmKEpjSXqs',
            language: 'en',
          }}
          styles={{
            textInput: styles.searchInput,
            container: { flex: 0 },
            listView: { backgroundColor: 'white' },
          }}
        />
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title={selectedLocation.name}
            description={selectedLocation.address}
            pinColor="red"
          />
        )}
      </MapView>

      {/* Confirmation Dialog */}
      {showConfirmDialog && selectedLocation && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Add Destination?</Text>
            <Text style={styles.dialogText}>{selectedLocation.name}</Text>
            <Text style={styles.dialogSubtext}>{selectedLocation.address}</Text>
            
            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={[styles.dialogButton, styles.cancelButton]}
                onPress={() => setShowConfirmDialog(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.dialogButton, styles.confirmButton]}
                onPress={handleSaveDestination}
              >
                <Text style={styles.confirmButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function SavedDestinationsScreen() {
  const openGoogleMapsNavigation = (latitude: number, longitude: number, name: string) => {
    const scheme = Platform.select({ 
      ios: 'maps:', 
      android: 'google.navigation:' 
    });
    
    const url = Platform.select({
      ios: `${scheme}q=${latitude},${longitude}`,
      android: `${scheme}q=${latitude},${longitude}`
    });

    Linking.canOpenURL(url!).then(supported => {
      if (supported) {
        Linking.openURL(url!);
      } else {
        // Fallback to browser Google Maps
        const browserUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        Linking.openURL(browserUrl);
      }
    }).catch(err => {
      Alert.alert('Error', 'Could not open maps application');
      console.error('Maps error:', err);
    });
  };

  const renderDestination = ({ item }: { item: typeof DUMMY_DESTINATIONS[0] }) => (
    <TouchableOpacity
      style={styles.destinationCard}
      onPress={() => openGoogleMapsNavigation(item.latitude, item.longitude, item.name)}
    >
      <View style={styles.destinationIcon}>
        <Text style={styles.destinationIconText}>📍</Text>
      </View>
      <View style={styles.destinationInfo}>
        <Text style={styles.destinationName}>{item.name}</Text>
        <Text style={styles.destinationAddress}>{item.address}</Text>
      </View>
      <View style={styles.navigationArrow}>
        <Text style={styles.navigationArrowText}>→</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.savedDestinationsContainer}>
      {DUMMY_DESTINATIONS.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No saved destinations yet</Text>
          <Text style={styles.emptySubtext}>Add your first destination to get started</Text>
        </View>
      ) : (
        <FlatList
          data={DUMMY_DESTINATIONS}
          renderItem={renderDestination}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#050816',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Savespot' }}
        />
        <Stack.Screen
          name="AddDestination"
          component={AddDestinationScreen}
          options={{ title: 'Add Destination' }}
        />
        <Stack.Screen
          name="SavedDestinations"
          component={SavedDestinationsScreen}
          options={{ title: 'Saved Destinations' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050816',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  secondaryButtonText: {
    color: '#4F46E5',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  mapContainer: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  map: {
    flex: 1,
  },
  dialogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#050816',
    marginBottom: 12,
    textAlign: 'center',
  },
  dialogText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#050816',
    marginBottom: 8,
    textAlign: 'center',
  },
  dialogSubtext: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  dialogButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  dialogButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E5E5E5',
  },
  cancelButtonText: {
    color: '#050816',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4F46E5',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  destinationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  destinationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  destinationIconText: {
    fontSize: 24,
  },
  destinationInfo: {
    flex: 1,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  destinationAddress: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  navigationArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationArrowText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  savedDestinationsContainer: {
    flex: 1,
    backgroundColor: '#050816',
  },
});