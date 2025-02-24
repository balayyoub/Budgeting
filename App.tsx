import React from 'react';
import { StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RealmProvider } from './realm/RealmProvider';
import BudgetOverviewScreen from './components/BudgetOverviewScreen';
import AddTransactionScreen from './components/AddTransactionScreen';
import TransactionsScreen from './components/TransactionsScreen';
import CategoriesManagementScreen from './components/CategoriesManagementScreen';
import SettingsScreen from './components/SettingsScreen';
import AccountManagementScreen from './components/AccountManagementScreen';

// Bottom Tabs Navigation
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    // 2) Wrap the entire NavigationContainer with RealmProvider
    <RealmProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="AccountManagement" component={AccountManagementScreen} />
          <Stack.Screen name="CategoriesManagement" component={CategoriesManagementScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </RealmProvider>
  );
};

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string = '';

          switch (route.name) {
            case 'BudgetOverview':
              iconName = 'dollar';
              break;
            case 'Transactions':
              iconName = 'list-alt';
              break;
            case 'Settings':
              iconName = 'cog';
              break;
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="BudgetOverview" component={BudgetOverviewScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// Styles
export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1C1C', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  headerButton: { padding: 10 },
  headerText: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  progressBarContainer: { flexDirection: 'row', height: 10, marginVertical: 10 },
  progressBar: { height: 10 },
  content: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  label: { color: 'white', fontSize: 16 },
  income: { color: 'green', fontWeight: 'bold' },
  expense: { color: 'red', fontWeight: 'bold' },
  category: { color: '#ccc' },
  amount: { color: 'white' },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  balance: { color: 'blue', fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 20 },
  button: { backgroundColor: '#444', padding: 10, borderRadius: 5 },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

export default App;
