import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRealm } from '../realm/RealmProvider';
import { Transaction } from '../models/Transaction';
import AccountSelectionModal from './AccountSelectionModal';
import HelpModal from './HelpModal';
import { BSON } from 'realm';

interface CategoryTotal {
  name: string;
  amount: number;
}

const BudgetOverviewScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const realm = useRealm();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Period');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [income, setIncome] = useState<number>(0);
  const [expenses, setExpenses] = useState<number>(0);
  const [incomeCategoryTotals, setIncomeCategoryTotals] = useState<CategoryTotal[]>([]);
  const [expenseCategoryTotals, setExpenseCategoryTotals] = useState<CategoryTotal[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isHelpModalVisible, setIsHelpModalVisible] = useState<boolean>(false);

  const calculateTotals = () => {
    let transactions = realm.objects<Transaction>('Transaction');

    if (selectedAccounts.length > 0) {
      transactions = transactions.filtered('account._id IN $0', selectedAccounts.map((id) => new BSON.ObjectId(id)));
    }

    const totalIncome = transactions.filtered('type == "income"').sum('amount');
    const totalExpenses = transactions.filtered('type == "expense"').sum('amount');

    const incomeCategoryTotalsMap: { [key: string]: number } = {};
    const expenseCategoryTotalsMap: { [key: string]: number } = {};

    transactions.forEach((transaction) => {
      const categoryName = transaction.category.name;
      if (transaction.type === 'income') {
        if (!incomeCategoryTotalsMap[categoryName]) {
          incomeCategoryTotalsMap[categoryName] = 0;
        }
        incomeCategoryTotalsMap[categoryName] += transaction.amount;
      } else if (transaction.type === 'expense') {
        if (!expenseCategoryTotalsMap[categoryName]) {
          expenseCategoryTotalsMap[categoryName] = 0;
        }
        expenseCategoryTotalsMap[categoryName] += transaction.amount;
      }
    });

    const incomeCategoryTotalsArray: CategoryTotal[] = Object.keys(incomeCategoryTotalsMap).map((key) => ({
      name: key,
      amount: incomeCategoryTotalsMap[key],
    }));

    const expenseCategoryTotalsArray: CategoryTotal[] = Object.keys(expenseCategoryTotalsMap).map((key) => ({
      name: key,
      amount: expenseCategoryTotalsMap[key],
    }));

    setIncome(totalIncome);
    setExpenses(totalExpenses);
    setIncomeCategoryTotals(incomeCategoryTotalsArray);
    setExpenseCategoryTotals(expenseCategoryTotalsArray);
  };

  useEffect(() => {
    calculateTotals();

    const transactionListener = () => {
      calculateTotals();
    };

    const transactions = realm.objects<Transaction>('Transaction');
    transactions.addListener(transactionListener);

    return () => {
      transactions.removeListener(transactionListener);
    };
  }, [realm, selectedAccounts]);

  const total = income + expenses;
  const incomeProgress = income / total;
  const expensesProgress = expenses / total;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => setIsHelpModalVisible(true)}>
          <Icon name="question-circle" size={20} color="#777" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.headerText}>{selectedPeriod}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerButton} onPress={() => setIsModalVisible(true)}>
          <Icon name="bank" size={20} color="#777" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={{ flex: expensesProgress }}>
          <ProgressBar progress={1} color="red" style={styles.progressBar} />
        </View>
        <View style={{ flex: incomeProgress }}>
          <ProgressBar progress={1} color="green" style={styles.progressBar} />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>Income</Text>
          <Text style={styles.income}>JOD {income.toFixed(3)}</Text>
        </View>
        {incomeCategoryTotals.map((item, index) => (
          <View style={styles.row} key={index}>
            <Text style={styles.category}>{item.name}</Text>
            <Text style={styles.amount}>JOD {item.amount.toFixed(3)}</Text>
          </View>
        ))}
        <View style={styles.row}>
          <Text style={styles.label}>Expense</Text>
          <Text style={styles.expense}>JOD {expenses.toFixed(3)}</Text>
        </View>
        {expenseCategoryTotals.map((item, index) => (
          <View style={styles.row} key={index}>
            <Text style={styles.category}>{item.name}</Text>
            <Text style={styles.amount}>JOD {item.amount.toFixed(3)}</Text>
          </View>
        ))}
        <View style={styles.balanceRow}>
          <Text style={styles.label}>Balance</Text>
          <Text style={styles.balance}>JOD {(income - expenses).toFixed(3)}</Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddTransaction', { type: 'expense' })}>
          <Text style={styles.buttonText}>+ Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddTransaction', { type: 'income' })}>
          <Text style={styles.buttonText}>+ Income</Text>
        </TouchableOpacity>
      </View>

      {/* Account Selection Modal */}
      <AccountSelectionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSelect={(selectedAccounts) => setSelectedAccounts(selectedAccounts)}
      />

      {/* Help Modal */}
      <HelpModal
        visible={isHelpModalVisible}
        onClose={() => setIsHelpModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  headerButton: { padding: 10 },
  headerText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  progressBarContainer: { flexDirection: 'row', height: 10, marginVertical: 10 },
  progressBar: { height: 10 },
  content: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  label: { fontSize: 16, color: '#333' },
  income: { color: 'green', fontWeight: 'bold' },
  expense: { color: 'red', fontWeight: 'bold' },
  category: { color: '#555' },
  amount: { color: '#555' },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  balance: { color: 'blue', fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 20 },
  button: { backgroundColor: '#007bff', padding: 10, borderRadius: 5 },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

export default BudgetOverviewScreen;
