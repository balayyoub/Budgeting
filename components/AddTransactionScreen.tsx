import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRealm } from '../realm/RealmProvider';
import { Transaction } from '../models/Transaction';
import { Category } from '../models/Category';
import { Account } from '../models/Account';
import { BSON } from 'realm';

const AddTransactionScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
  const realm = useRealm();
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>(route.params.type || 'expense');
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchedCategories = realm.objects<Category>('Category').filtered(`type == "${type}"`);
    const fetchedAccounts = realm.objects<Account>('Account');
    setCategories(Array.from(fetchedCategories));
    setAccounts(Array.from(fetchedAccounts));
    if (fetchedCategories.length > 0) {
      setSelectedCategory(fetchedCategories[0]._id.toHexString());
    }
    if (fetchedAccounts.length > 0) {
      setSelectedAccount(fetchedAccounts[0]._id.toHexString());
    }

    if (route.params.transaction) {
      const transaction = route.params.transaction as Transaction;
      setAmount(transaction.amount.toString());
      setDescription(transaction.description || '');
      setType(transaction.type);
      setDate(new Date(transaction.dateTime));
      setSelectedCategory(transaction.category._id.toHexString());
      setSelectedAccount(transaction.account._id.toHexString());
      setIsEditing(true);
      setEditingTransactionId(transaction._id.toHexString());
    }
  }, [realm, type, route.params]);

  const saveTransaction = () => {
    realm.write(() => {
      if (isEditing && editingTransactionId) {
        const transaction = realm.objectForPrimaryKey(Transaction, new BSON.ObjectId(editingTransactionId));
        if (transaction) {
          transaction.type = type;
          transaction.dateTime = date;
          transaction.amount = parseFloat(amount);
          transaction.category = realm.objectForPrimaryKey(Category, new BSON.ObjectId(selectedCategory));
          transaction.account = realm.objectForPrimaryKey(Account, new BSON.ObjectId(selectedAccount));
          transaction.description = description;
        }
      } else {
        realm.create('Transaction', {
          _id: new BSON.ObjectId(),
          type,
          dateTime: date,
          amount: parseFloat(amount),
          category: realm.objectForPrimaryKey(Category, new BSON.ObjectId(selectedCategory)),
          account: realm.objectForPrimaryKey(Account, new BSON.ObjectId(selectedAccount)),
          description,
        });
      }
    });
    navigation.goBack(); // Navigate back to the BudgetOverviewScreen
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />
      <Text style={styles.label}>Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      <Text style={styles.label}>Category</Text>
      <Picker
        selectedValue={selectedCategory}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
      >
        {categories.map((category) => (
          <Picker.Item key={category._id.toHexString()} label={category.name} value={category._id.toHexString()} />
        ))}
      </Picker>
      <Text style={styles.label}>Account</Text>
      <Picker
        selectedValue={selectedAccount}
        onValueChange={(itemValue) => setSelectedAccount(itemValue)}
      >
        {accounts.map((account) => (
          <Picker.Item key={account._id.toHexString()} label={account.name} value={account._id.toHexString()} />
        ))}
      </Picker>
      <View style={styles.toggleContainer}>
        <Button title="Income" onPress={() => setType('income')} color={type === 'income' ? 'green' : 'gray'} />
        <Button title="Expense" onPress={() => setType('expense')} color={type === 'expense' ? 'red' : 'gray'} />
      </View>
      <Button title={isEditing ? 'Update Transaction' : `Add ${type}`} onPress={saveTransaction} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 20 },
  dateText: { fontSize: 16, color: 'blue', marginBottom: 20 },
  toggleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
});

export default AddTransactionScreen;
