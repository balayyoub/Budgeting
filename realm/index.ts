// realm/index.ts
import Realm from 'realm';
import { Category } from '../models/Category';
import { Account } from '../models/Account';
import { Transaction } from '../models/Transaction';

export const getRealm = (): Realm => {
  return new Realm({
    schema: [Category, Account, Transaction],
    schemaVersion: 1, // increment this when you update schemas
  });
};
