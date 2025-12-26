import { getRealm } from './realm';
import { Destination } from './models/Destination';
import Realm from 'realm';

export interface DestinationData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

// Create a new destination
export const createDestination = async (data: DestinationData): Promise<Destination> => {
  const realm = await getRealm();
  
  let newDestination: Destination;
  
  realm.write(() => {
    newDestination = realm.create<Destination>('Destination', {
      _id: new Realm.BSON.ObjectId(),
      name: data.name,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      createdAt: new Date(),
    });
  });
  
  return newDestination!;
};

// Get all destinations
export const getAllDestinations = async (): Promise<Destination[]> => {
  const realm = await getRealm();
  const destinations = realm.objects<Destination>('Destination').sorted('createdAt', true);
  return Array.from(destinations);
};

// Delete a destination
export const deleteDestination = async (id: string): Promise<void> => {
  const realm = await getRealm();
  const destination = realm.objectForPrimaryKey<Destination>('Destination', new Realm.BSON.ObjectId(id));
  
  if (destination) {
    realm.write(() => {
      realm.delete(destination);
    });
  }
};

// Update a destination
export const updateDestination = async (
  id: string,
  data: Partial<DestinationData>
): Promise<void> => {
  const realm = await getRealm();
  const destination = realm.objectForPrimaryKey<Destination>('Destination', new Realm.BSON.ObjectId(id));
  
  if (destination) {
    realm.write(() => {
      if (data.name !== undefined) destination.name = data.name;
      if (data.address !== undefined) destination.address = data.address;
      if (data.latitude !== undefined) destination.latitude = data.latitude;
      if (data.longitude !== undefined) destination.longitude = data.longitude;
    });
  }
};

// Search destinations by name
export const searchDestinations = async (searchTerm: string): Promise<Destination[]> => {
  const realm = await getRealm();
  const destinations = realm
    .objects<Destination>('Destination')
    .filtered('name CONTAINS[c] $0', searchTerm);
  return Array.from(destinations);
};
