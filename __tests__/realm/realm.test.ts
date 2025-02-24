// __tests__/realm.test.ts
import Realm, { BSON } from 'realm';
import { Transaction } from '../../models/Transaction';
import { Category } from '../../models/Category';
import { Account } from '../../models/Account';

describe('Realm Unit Tests', () => {
  let realm: Realm;

  beforeAll(() => {
    // Create an in-memory Realm for testing
    realm = new Realm({
      schema: [Transaction, Category, Account],
      inMemory: true,         // Important: ephemeral, does not persist
      path: 'testRealm-realm',      // Arbitrary path
      schemaVersion: 1,
    });
  });

  afterAll(() => {
    // Always close Realm to avoid memory leaks
    if (!realm.isClosed) {
      realm.close();
    }
  });

  it('should create a Transaction with linked Category and Account', () => {
    // Initially, no Transaction objects
    expect(realm.objects(Transaction.schema.name).length).toBe(0);

    // Write a new Transaction
    realm.write(() => {
      // Create or find a Category
      const groceries = realm.create(Category.schema.name, {
        _id: new BSON.ObjectId(),
        name: 'Groceries',
        type: 'expense', // Add type property
      });

      // Create or find an Account
      const mainAccount = realm.create(Account.schema.name, {
        _id: new BSON.ObjectId(),
        name: 'Main Account',
      });

      // Create the Transaction, linking to Category & Account
      realm.create(Transaction.schema.name, {
        _id: new BSON.ObjectId(),
        dateTime: new Date(),
        amount: 50.75,
        category: groceries,
        account: mainAccount,
      });
    });

    // Now we should have 1 Transaction
    const allTransactions = realm.objects<Transaction>(Transaction.schema.name);
    expect(allTransactions.length).toBe(1);

    // Check fields
    const tx = allTransactions[0];
    expect(tx.amount).toBe(50.75);
    expect(tx.category.name).toBe('Groceries');
    expect(tx.category.type).toBe('expense'); // Check type property
    expect(tx.account.name).toBe('Main Account');
  });
});
