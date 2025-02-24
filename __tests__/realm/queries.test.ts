import Realm, { BSON } from 'realm';

import { Transaction } from '../../models/Transaction';
import { Account } from '../../models/Account';
import { Category } from '../../models/Category';
import { ObjectId } from 'bson';

// Initialize Realm for tests
let realm: Realm;
let groceries: Realm.Object<{ _id: ObjectId; name: string; type: string }, never> & { _id: ObjectId; name: string; type: string };
let mainAccount: Realm.Object<{ _id: ObjectId; name: string }, never> & { _id: ObjectId; name: string };
let transaction: Realm.Object<Transaction> & Transaction;

beforeAll(() => {
    // Create an in-memory Realm for testing
    realm = new Realm({
        schema: [Transaction, Category, Account],
        inMemory: true,         // Important: ephemeral, does not persist
        path: 'testRealm',      // Arbitrary path
        schemaVersion: 1,
    });
    realm.write(() => {
        // Create or find a Category
        groceries = realm.create(Category.schema.name, {
            _id: new BSON.ObjectId(),
            name: 'Groceries',
            type: 'expense', // Add type property
        });

        // Create or find an Account
        mainAccount = realm.create(Account.schema.name, {
            _id: new BSON.ObjectId(),
            name: 'Main Account',
        });

        // Insert sample transaction
        transaction = realm.create('Transaction', {
            _id: new Realm.BSON.ObjectId(),
            type: 'expense',
            amount: 100.5,
            category: groceries,
            account: mainAccount,
            dateTime: new Date(),
            description: 'Lunch',
            note: '',
        });
    });
});

afterAll(() => {
    realm.close();
});

test('Fetch transactions by category', () => {
  const transactions = realm.objects<Transaction>('Transaction').filtered('category.name == "Groceries"');
  expect(transactions.length).toBe(1);
  expect(transactions[0].amount).toBe(transaction.amount);
});

test('Fetch transactions by type', () => {
  const transactions = realm.objects<Transaction>('Transaction').filtered('type == "expense"');
  expect(transactions.length).toBe(1);
  expect(transactions[0].amount).toBe(transaction.amount);
});
