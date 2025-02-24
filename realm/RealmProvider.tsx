// RealmProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import Realm, { BSON } from 'realm';
import { getRealm } from '.';
import { Category } from '../models/Category';
import { Account } from '../models/Account';
import { DEFAULT_CATEGORIES, DEFAULT_ACCOUNT } from './defaultData';

const RealmContext = createContext<Realm | null>(null);

export const RealmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [realm, setRealm] = useState<Realm | null>(null);

  useEffect(() => {
    const realmInstance = getRealm();

    // Insert default categories if none exist
    const existingCategories = realmInstance.objects<Category>(Category.schema.name);
    if (existingCategories.length === 0) {
      realmInstance.write(() => {
        DEFAULT_CATEGORIES.forEach((category) => {
          realmInstance.create(Category.schema.name, {
            _id: new BSON.ObjectId(),
            name: category.name,
            type: category.type,
          });
        });
      });
    }

    // Insert default account if none exist
    const existingAccounts = realmInstance.objects<Account>(Account.schema.name);
    if (existingAccounts.length === 0) {
      realmInstance.write(() => {
        realmInstance.create(Account.schema.name, {
          _id: new BSON.ObjectId(),
          name: DEFAULT_ACCOUNT,
        });
      });
    }

    setRealm(realmInstance);

    // Close Realm when the provider unmounts
    return () => {
      if (!realmInstance.isClosed) {
        realmInstance.close();
      }
    };
  }, []);

  // Optional: show a loading indicator until Realm is ready
  if (!realm) {
    return null;
  }

  return <RealmContext.Provider value={realm}>{children}</RealmContext.Provider>;
};

export const useRealm = (): Realm => {
  const realm = useContext(RealmContext);
  if (!realm) {
    throw new Error('Realm context is not available!');
  }
  return realm;
};
