import Realm from 'realm';
import { Destination } from './models/Destination';

let realmInstance: Realm | null = null;

export const getRealm = async (): Promise<Realm> => {
  if (realmInstance) {
    return realmInstance;
  }

  try {
    realmInstance = await Realm.open({
      schema: [Destination],
      schemaVersion: 1,
    });
    return realmInstance;
  } catch (error) {
    console.error('Error opening Realm:', error);
    throw error;
  }
};

export const closeRealm = () => {
  if (realmInstance && !realmInstance.isClosed) {
    realmInstance.close();
    realmInstance = null;
  }
};