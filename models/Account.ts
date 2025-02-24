// models/Account.ts
import Realm, { BSON } from 'realm';

export class Account extends Realm.Object<Account> {
  _id!: BSON.ObjectId;
  name!: string;

  static schema: Realm.ObjectSchema = {
    name: 'Account',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      name: 'string',
    },
  };
}
