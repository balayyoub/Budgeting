import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Button } from 'react-native';
import { useRealm } from '../realm/RealmProvider';
import { Account } from '../models/Account';

interface AccountSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (selectedAccounts: string[]) => void;
}

const AccountSelectionModal: React.FC<AccountSelectionModalProps> = ({ visible, onClose, onSelect }) => {
    const realm = useRealm();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

    useEffect(() => {
        const fetchedAccounts = realm.objects<Account>('Account');
        setAccounts(fetchedAccounts);
    }, [realm]);

    const toggleAccountSelection = (accountId: string) => {
        setSelectedAccounts((prevSelectedAccounts) =>
            prevSelectedAccounts.includes(accountId)
                ? prevSelectedAccounts.filter((id) => id !== accountId)
                : [...prevSelectedAccounts, accountId]
        );
    };

    const handleSelect = () => {
        onSelect(selectedAccounts);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Select Accounts</Text>
                    <FlatList
                        data={accounts}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.accountItem}
                                onPress={() => toggleAccountSelection(item._id.toHexString())}
                            >
                                <Text style={styles.accountName}>{item.name}</Text>
                                {selectedAccounts.includes(item._id.toHexString()) && <Text style={styles.selected}>Selected</Text>}
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item._id.toHexString()}
                    />
                    <Button title="Select" onPress={handleSelect} />
                    <Button title="Cancel" onPress={onClose} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    accountItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
    accountName: { fontSize: 16 },
    selected: { color: 'green' },
});

export default AccountSelectionModal;
