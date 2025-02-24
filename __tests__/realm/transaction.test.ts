// Tests transaction creation, update, deletion
import Realm, { BSON } from 'realm';

import { Transaction } from '../../models/Transaction';
import { Account } from '../../models/Account';
import { Category } from '../../models/Category';
import { ObjectId } from 'bson';

describe('Realm Insert Transaction', () => {
    let realm: Realm;
    let groceries: Realm.Object<{ _id: ObjectId; name: string; type: string }, never> & { _id: ObjectId; name: string; type: string };
    let mainAccount: Realm.Object<{ _id: ObjectId; name: string }, never> & { _id: ObjectId; name: string };

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
        });
    });

    afterAll(() => {
        realm.close();
    });

    it('should insert a transaction correctly', () => {
      let transaction;
      realm.write(() => {
        transaction = realm.create('Transaction', {
          _id: new Realm.BSON.ObjectId(),
          type: 'expense',
          amount: 100.5,
          category: groceries,
          account: mainAccount,
          dateTime: new Date(),
          description: 'Lunch',
          note: 'Extended lunch',
        });
      });

      const storedTransaction = realm.objects('Transaction')[0];
      expect(storedTransaction).toBeDefined();
      expect(storedTransaction.amount).toBe(100.5);
      expect(storedTransaction.category.name).toBe('Groceries');
      expect(storedTransaction.category.type).toBe('expense'); // Check type property
      expect(storedTransaction.account.name).toBe('Main Account');
    });

    it('should update a transaction amount', () => {
        let transaction: Realm.Object<Transaction> & Transaction;
        realm.write(() => {
            transaction = realm.create('Transaction', {
                _id: new Realm.BSON.ObjectId(),
                type: 'expense',
                amount: 100.5,
                category: groceries,
                account: mainAccount,
                dateTime: new Date(),
                description: 'Lunch',
                note: 'Extended lunch',
            });
        });
        let transactionId = transaction._id;
        realm.write(() => {
          const updateTransaction = realm.objectForPrimaryKey('Transaction', transactionId);
          if (updateTransaction) {updateTransaction.amount = 150.75;}
        });

        const updatedTransaction = realm.objectForPrimaryKey('Transaction', transactionId);
        expect(updatedTransaction?.amount).toBe(150.75);
    });

    it('should delete a transaction', () => {
        let transaction: Realm.Object<Transaction> & Transaction;
        realm.write(() => {
            transaction = realm.create('Transaction', {
                _id: new Realm.BSON.ObjectId(),
                type: 'expense',
                amount: 100.5,
                category: groceries,
                account: mainAccount,
                dateTime: new Date(),
                description: 'Lunch',
                note: 'Extended lunch',
            });
        });
        let transactionId = transaction._id;
        realm.write(() => {
            const deleteTransaction = realm.objectForPrimaryKey('Transaction', transactionId);
            if (deleteTransaction) {realm.delete(deleteTransaction);}
        });

        const deletedTransaction = realm.objectForPrimaryKey('Transaction', transactionId);
        expect(deletedTransaction).toBeNull();
    });
});
