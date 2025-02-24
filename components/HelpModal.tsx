import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';

interface HelpModalProps {
    visible: boolean;
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ visible, onClose }) => {
    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Help</Text>
                    <Text style={styles.text}>Here you can find information about how to use the BudgetOverview Screen.</Text>
                    <Text style={styles.text}>- Use the filters to view transactions by type or account.</Text>
                    <Text style={styles.text}>- Tap on a transaction to edit it.</Text>
                    <Text style={styles.text}>- Long press on a transaction to select multiple transactions for deletion.</Text>
                    <Text style={styles.text}>- Use the buttons at the bottom to add new income or expense transactions.</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    text: { fontSize: 16, marginBottom: 10 },
    closeButton: { marginTop: 20, padding: 10, backgroundColor: '#444', borderRadius: 5 },
    closeButtonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
});

export default HelpModal;
