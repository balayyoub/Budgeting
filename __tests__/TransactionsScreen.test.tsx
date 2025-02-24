import React, { useState, useEffect } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import TransactionsScreen from '../components/TransactionsScreen';
import AddTransactionScreen from '../components/AddTransactionScreen';
import Realm, { BSON } from 'realm';
import { Transaction } from '../models/Transaction';
import { Category } from '../models/Category';
import { Account } from '../models/Account';
import { useRealm } from '../realm/RealmProvider';

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

const renderWithNavigation = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Transactions" component={TransactionsScreen} />
        <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

test('updates a transaction and reflects changes in TransactionsScreen', async () => {
  const { getByText, getByPlaceholderText, getByDisplayValue } = renderWithNavigation(<TransactionsScreen />);

  // Navigate to edit transaction screen
  fireEvent.press(getByText('Edit'));

  // Verify that the AddTransactionScreen is displayed with the transaction details
  await waitFor(() => getByDisplayValue('100.5'));
  expect(getByDisplayValue('100.5')).toBeTruthy();
  expect(getByDisplayValue('Lunch')).toBeTruthy();

  // Update the transaction amount and description
  fireEvent.changeText(getByPlaceholderText('Amount'), '200.75');
  fireEvent.changeText(getByPlaceholderText('Description'), 'Dinner');

  // Save the updated transaction
  fireEvent.press(getByText('Update Transaction'));

  // Verify that the TransactionsScreen is displayed with the updated transaction details
  await waitFor(() => getByText('200.75'));
  expect(getByText('200.75')).toBeTruthy();
  expect(getByText('Dinner')).toBeTruthy();
});

const TransactionsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const realm = useRealm();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [sortOption, setSortOption] = useState<string>('date');
  const [filterOption, setFilterOption] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [incomeTotal, setIncomeTotal] = useState<number>(0);
  const [expenseTotal, setExpenseTotal] = useState<number>(0);
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();

    const transactions = realm.objects<Transaction>('Transaction');
    transactions.addListener(() => {
      fetchTransactions();
    });

    return () => {
      transactions.removeAllListeners();
    };
  }, [sortOption, filterOption, selectedAccount]);

  const fetchAccounts = () => {
    const fetchedAccounts = realm.objects<Account>('Account');
    setAccounts(fetchedAccounts);
  };

  const fetchTransactions = () => {
    let results = realm.objects<Transaction>('Transaction');

    if (filterOption !== 'all') {
      results = results.filtered('type == $0', filterOption);
    }

    if (selectedAccount !== 'all') {
      results = results.filtered('account.name == $0', selectedAccount);
    }

    if (sortOption === 'date') {
      results = results.sorted('dateTime', true);
    } else if (sortOption === 'amount') {
      results = results.sorted('amount', true);
    }

    setTransactions(results);
    calculateTotals(results);
  };

  const calculateTotals = (transactions: Realm.Results<Transaction>) => {
    const income = transactions.filtered('type == "income"').sum('amount');
    const expenses = transactions.filtered('type == "expense"').sum('amount');
    setIncomeTotal(income);
    setExpenseTotal(expenses);
  };

  const editTransaction = (transaction: Transaction) => {
    navigation.navigate('AddTransaction', { transaction });
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedTransactions([]);
  };

  const toggleTransactionSelection = (transactionId: string) => {
    setSelectedTransactions((prevSelectedTransactions) =>
      prevSelectedTransactions.includes(transactionId)
        ? prevSelectedTransactions.filter((id) => id !== transactionId)
        : [...prevSelectedTransactions, transactionId]
    );
  };

  const deleteSelectedTransactions = () => {
    Alert.alert(
      'Delete Transactions',
      `Are you sure you want to delete ${selectedTransactions.length} transactions?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            realm.write(() => {
              selectedTransactions.forEach((transactionId) => {
                const transaction = realm.objectForPrimaryKey('Transaction', new BSON.ObjectId(transactionId));
                if (transaction) {
                  realm.delete(transaction);
                }
              });
            });
            fetchTransactions();
            setIsSelectionMode(false);
            setSelectedTransactions([]);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={[styles.transactionRow, isSelectionMode && styles.selectionMode]}
      onPress={() => (isSelectionMode ? toggleTransactionSelection(item._id.toHexString()) : editTransaction(item))}
      onLongPress={toggleSelectionMode}
    >
      {isSelectionMode && (
        <View style={styles.checkbox}>
          {selectedTransactions.includes(item._id.toHexString()) && <Text style={styles.checkboxText}>✓</Text>}
        </View>
      )}
      <Text style={styles.transactionDate}>{item.dateTime.toDateString()}</Text>
      <Text style={styles.transactionCategory}>{item.category.name}</Text>
      <Text style={styles.transactionAmount}>JOD {item.amount.toFixed(2)}</Text>
      <Text style={styles.transactionDescription}>{item.description}</Text>
      <Text style={styles.transactionAccount}>{item.account.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Text style={styles.label}>Filter by:</Text>
        <Picker
          selectedValue={filterOption}
          style={styles.picker}
          onValueChange={(itemValue) => setFilterOption(itemValue)}
        >
          <Picker.Item label="All" value="all" />
          <Picker.Item label="Income" value="income" />
          <Picker.Item label="Expense" value="expense" />
        </Picker>
      </View>
      <View style={styles.filterContainer}>
        <Text style={styles.label}>Account:</Text>
        <Picker
          selectedValue={selectedAccount}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedAccount(itemValue)}
        >
          <Picker.Item label="All" value="all" />
          {accounts.map((account) => (
            <Picker.Item key={account._id.toHexString()} label={account.name} value={account.name} />
          ))}
        </Picker>
      </View>
      <View style={styles.sortContainer}>
        <Text style={styles.label}>Sort by:</Text>
        <Picker
          selectedValue={sortOption}
          style={styles.picker}
          onValueChange={(itemValue) => setSortOption(itemValue)}
        >
          <Picker.Item label="Date" value="date" />
          <Picker.Item label="Amount" value="amount" />
        </Picker>
      </View>
      <View style={styles.totalsContainer}>
        <Text style={styles.totalText}>Total Income: JOD {incomeTotal.toFixed(2)}</Text>
        <Text style={styles.totalText}>Total Expense: JOD {expenseTotal.toFixed(2)}</Text>
      </View>
      {isSelectionMode && (
        <View style={styles.selectionActions}>
          <TouchableOpacity style={styles.selectionButton} onPress={deleteSelectedTransactions}>
            <Text style={styles.selectionButtonText}>Delete Selected</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.selectionButton} onPress={toggleSelectionMode}>
            <Text style={styles.selectionButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item._id.toHexString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  filterContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sortContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  totalsContainer: { flexDirection: 'column', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontSize: 16, marginRight: 10 },
  picker: { flex: 1 },
  transactionRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectionMode: {
    backgroundColor: '#f0f0f0',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxText: {
    fontSize: 16,
    color: 'green',
  },
  transactionDate: { fontSize: 16, fontWeight: 'bold' },
  transactionCategory: { fontSize: 16, color: '#555' },
  transactionAmount: { fontSize: 16, color: 'green' },
  transactionDescription: { fontSize: 14, color: '#777' },
  transactionAccount: { fontSize: 14, color: '#777' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'flex-end' },
  editText: { color: 'blue', marginRight: 10 },
  deleteText: { color: 'red' },
  totalText: { fontSize: 16, fontWeight: 'bold' },
  selectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  selectionButton: {
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 5,
  },
  selectionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TransactionsScreen;
