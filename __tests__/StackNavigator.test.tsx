import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TransactionsScreen from '../components/TransactionsScreen';
import AddTransactionScreen from '../components/AddTransactionScreen';
import Realm, { BSON } from 'realm';
import { Transaction } from '../models/Transaction';
import { Category } from '../models/Category';
import { Account } from '../models/Account';

const Stack = createStackNavigator();

let mockRealm: Realm;
let mockTransaction: Realm.Object<Transaction> & Transaction;
let mockAccount: Realm.Object<Account> & Account;

beforeAll(() => {
  // Create an in-memory Realm for testing
  mockRealm = new Realm({
    schema: [Transaction, Category, Account],
    inMemory: true, // Important: ephemeral, does not persist
    path: 'testRealm', // Arbitrary path
    schemaVersion: 1,
  });

  mockRealm.write(() => {
    // Create or find a Category
    const groceries = mockRealm.create(Category.schema.name, {
      _id: new BSON.ObjectId(),
      name: 'Groceries',
      type: 'expense',
    });

    // Create or find an Account
    mockAccount = mockRealm.create(Account.schema.name, {
      _id: new BSON.ObjectId(),
      name: 'Main Account',
    });

    // Create a Transaction
    mockTransaction = mockRealm.create(Transaction.schema.name, {
      _id: new BSON.ObjectId(),
      type: 'expense',
      amount: 100.5,
      category: groceries,
      account: mockAccount,
      dateTime: new Date(),
      description: 'Lunch',
    });
  });
});

afterAll(() => {
  mockRealm.close();
});

jest.mock('../realm/RealmProvider', () => ({
  useRealm: () => mockRealm,
}));

const TestNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

test('Stack Navigator loads correctly', () => {
  const { getByText } = render(<TestNavigator />);
  // Check if the initial screen is rendered
  expect(getByText('Transactions')).toBeTruthy();
});
