import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Button, Alert } from 'react-native';
import { useRealm } from '../realm/RealmProvider';
import { Category } from '../models/Category';
import { Transaction } from '../models/Transaction';
import { BSON } from 'realm';

const CategoriesManagementScreen: React.FC = () => {
  const realm = useRealm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('income');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [categoryType]);

  const fetchCategories = () => {
    const results = realm.objects<Category>('Category').filtered('type == $0', categoryType);
    setCategories(results);
  };

  const addCategory = () => {
    if (categoryName.trim() === '') {
      Alert.alert('Error', 'Category name cannot be empty');
      return;
    }

    realm.write(() => {
      realm.create('Category', {
        _id: new BSON.ObjectId(),
        name: categoryName,
        type: categoryType,
      });
    });

    setCategoryName('');
    fetchCategories();
  };

  const editCategory = (category: Category) => {
    setCategoryName(category.name);
    setCategoryType(category.type);
    setIsEditing(true);
    setEditingCategoryId(category._id.toHexString());
  };

  const updateCategory = () => {
    if (editingCategoryId) {
      realm.write(() => {
        const category = realm.objectForPrimaryKey('Category', new BSON.ObjectId(editingCategoryId));
        if (category) {
          category.name = categoryName;
          category.type = categoryType;
        }
      });

      setCategoryName('');
      setIsEditing(false);
      setEditingCategoryId(null);
      fetchCategories();
    }
  };

  const deleteCategory = (categoryId: string) => {
    const category = realm.objectForPrimaryKey('Category', new BSON.ObjectId(categoryId));
    if (category) {
      const transactions = realm.objects<Transaction>('Transaction').filtered('category._id == $0', category._id);
      if (transactions.length > 0) {
        Alert.alert(
          'Cannot Delete Category',
          'This category has related transactions. Please delete all related transactions first.',
          [{ text: 'OK' }]
        );
        return;
      }

      realm.write(() => {
        realm.delete(category);
      });

      fetchCategories();
    }
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <View style={styles.categoryRow}>
      <Text style={styles.categoryText}>{item.name}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => editCategory(item)}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteCategory(item._id.toHexString())}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <Button title="Income" onPress={() => setCategoryType('income')} color={categoryType === 'income' ? 'green' : 'gray'} />
        <Button title="Expense" onPress={() => setCategoryType('expense')} color={categoryType === 'expense' ? 'red' : 'gray'} />
      </View>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item._id.toHexString()}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Category Name"
          value={categoryName}
          onChangeText={setCategoryName}
        />
        <Button title={isEditing ? 'Update' : 'Add'} onPress={isEditing ? updateCategory : addCategory} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  toggleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  categoryText: { fontSize: 16 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'flex-end' },
  editText: { color: 'blue', marginRight: 10 },
  deleteText: { color: 'red' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, marginRight: 10 },
});

export default CategoriesManagementScreen;
