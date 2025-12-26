import Realm, { ObjectSchema } from 'realm';

export class Destination extends Realm.Object<Destination> {
  _id!: Realm.BSON.ObjectId;
  name!: string;
  address!: string;
  latitude!: number;
  longitude!: number;
  createdAt!: Date;

  static schema: ObjectSchema = {
    name: 'Destination',
    primaryKey: '_id',
    properties: {
      _id: { type: 'objectId', default: () => new Realm.BSON.ObjectId() },
      name: 'string',
      address: 'string',
      latitude: 'double',
      longitude: 'double',
      createdAt: { type: 'date', default: () => new Date() },
    },
  };
}