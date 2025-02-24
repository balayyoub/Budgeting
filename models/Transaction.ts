// models/Transaction.ts
import Realm, { BSON } from 'realm';
import { Category } from './Category';
import { Account } from './Account';

/**
 * Mandatory fields:
 *  - dateTime
 *  - amount
 *  - category
 *  - account
 *
 * Optional fields:
 *  - type (income/expense)
 *  - description
 *  - note
 *  - repeatingFrequency
 *  - repeatingEndDate
 */
export class Transaction extends Realm.Object<Transaction> {
  _id!: BSON.ObjectId;
  type?: 'income' | 'expense';
  dateTime!: Date;
  amount!: number;
  category!: Category;   // Mandatory reference to a Category
  account!: Account;     // Mandatory reference to an Account
  description?: string;
  note?: string;
  repeatingFrequency?: string;  // e.g. "Daily", "Weekly", "Monthly"
  repeatingEndDate?: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Transaction',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      type: 'string?',
      dateTime: 'date',
      amount: 'double',
      category: 'Category',
      account: 'Account',
      description: 'string?',
      note: 'string?',
      repeatingFrequency: 'string?',
      repeatingEndDate: 'date?',
    },
  };
}
