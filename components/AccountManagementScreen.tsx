import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Button, Alert } from 'react-native';
import { useRealm } from '../realm/RealmProvider';
import { Account } from '../models/Account';
import { Transaction } from '../models/Transaction';
import { BSON } from 'realm';
// import styles from './styles';

const AccountManagementScreen: React.FC = () => {
    const realm = useRealm();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [accountName, setAccountName] = useState<string>('');
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = () => {
        const fetchedAccounts = realm.objects<Account>('Account');
        setAccounts(fetchedAccounts);
    };

    const addAccount = () => {
        if (accountName.trim() === '') {
            Alert.alert('Error', 'Account name cannot be empty');
            return;
        }

        realm.write(() => {
            realm.create('Account', {
                _id: new BSON.ObjectId(),
                name: accountName,
            });
        });

        setAccountName('');
        fetchAccounts();
    };

    const editAccount = (account: Account) => {
        setAccountName(account.name);
        setEditingAccount(account);
    };

    const updateAccount = () => {
        if (accountName.trim() === '') {
            Alert.alert('Error', 'Account name cannot be empty');
            return;
        }

        if (editingAccount) {
            realm.write(() => {
                editingAccount.name = accountName;
            });

            setAccountName('');
            setEditingAccount(null);
            fetchAccounts();
        }
    };

    const deleteAccount = (account: Account) => {
        const transactions = realm.objects<Transaction>('Transaction').filtered('account._id == $0', account._id);
        if (transactions.length > 0) {
            Alert.alert(
                'Cannot Delete Account',
                'This account has related transactions. Please delete all related transactions first.',
                [{ text: 'OK' }]
            );
            return;
        }

        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete this account?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        realm.write(() => {
                            realm.delete(account);
                        });
                        fetchAccounts();
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const renderAccount = ({ item }: { item: Account }) => (
        <View style={styles.accountRow}>
            <Text style={styles.accountName}>{item.name}</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => editAccount(item)}>
                    <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteAccount(item)}>
                    <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Account Management</Text>
            <TextInput
                style={styles.input}
                placeholder="Account Name"
                value={accountName}
                onChangeText={setAccountName}
            />
            <Button
                title={editingAccount ? 'Update Account' : 'Add Account'}
                onPress={editingAccount ? updateAccount : addAccount}
            />
            <FlatList
                data={accounts}
                renderItem={renderAccount}
                keyExtractor={(item) => item._id.toHexString()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 20 },
    accountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    accountName: { fontSize: 16 },
    buttonContainer: { flexDirection: 'row' },
    editText: { color: 'blue', marginRight: 10 },
    deleteText: { color: 'red' },
});

export default AccountManagementScreen;
