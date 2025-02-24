// models/Category.ts
import Realm, { BSON } from 'realm';

export class Category extends Realm.Object<Category> {
  _id!: BSON.ObjectId;
  name!: string;
  type!: 'income' | 'expense';

  static schema: Realm.ObjectSchema = {
    name: 'Category',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      name: 'string',
      type: 'string',
    },
  };
}
