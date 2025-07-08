// Shopping List Modal - Modal zur Verwaltung und Bearbeitung von Einkaufslisten
import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../contexts/ThemeContext';
import {useShoppingList} from '../hooks/useShoppingList';
import {showToast} from '../utils/toast';

export const ShoppingListModal = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const {
    shoppingList,
    isLoading,
    addItem,
    toggleItem,
    removeItem,
    clearCompleted,
    refreshList,
    completedCount,
    pendingCount,
  } = useShoppingList();
  const [newItemText, setNewItemText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  React.useEffect(() => {
    if (visible) {
      refreshList();
    }
  }, [visible]); 
  const handleAddItem = async () => {
    if (!newItemText.trim()) return;
    setIsAdding(true);
    try {
      await addItem(newItemText);
      setNewItemText('');
      showToast('Item added to shopping list! 🛒');
    } catch (error) {
      showToast('Failed to add item. Please try again.', 'error');
    } finally {
      setIsAdding(false);
    }
  };
  const handleToggleItem = async (itemId) => {
    try {
      await toggleItem(itemId);
    } catch (error) {
      showToast('Failed to update item. Please try again.', 'error');
    }
  };
  const handleRemoveItem = (itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeItem(itemId);
              showToast('Item removed from shopping list');
            } catch (error) {
              showToast('Failed to remove item. Please try again.', 'error');
            }
          },
        },
      ]
    );
  };
  const handleClearCompleted = () => {
    if (completedCount === 0) return;
    Alert.alert(
      'Clear Completed',
      `Remove ${completedCount} completed item${completedCount > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCompleted();
              showToast('Completed items cleared! ✨');
            } catch (error) {
              showToast('Failed to clear items. Please try again.', 'error');
            }
          },
        },
      ]
    );
  };
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="basket-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.headerTitle}>Shopping List</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        {}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          {completedCount > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={handleClearCompleted}
            >
              <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        {}
        <View style={styles.addItemContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Add new item..."
            placeholderTextColor={theme.colors.textSecondary}
            value={newItemText}
            onChangeText={setNewItemText}
            onSubmitEditing={handleAddItem}
            returnKeyType="done"
            maxLength={100}
          />
          <TouchableOpacity
            style={[
              styles.addButton,
              { opacity: newItemText.trim() ? 1 : 0.5 }
            ]}
            onPress={handleAddItem}
            disabled={!newItemText.trim() || isAdding}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="add" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
        {}
        <ScrollView 
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading shopping list...</Text>
            </View>
          ) : shoppingList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="basket-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>Your shopping list is empty</Text>
              <Text style={styles.emptySubtitle}>Add items to keep track of your groceries!</Text>
            </View>
          ) : (
            <View style={styles.itemsList}>
              {}
              {shoppingList
                .filter(item => !item.completed)
                .map((item) => (
                  <ShoppingListItem
                    key={item.id}
                    item={item}
                    onToggle={handleToggleItem}
                    onRemove={handleRemoveItem}
                    theme={theme}
                  />
                ))}
              {}
              {shoppingList
                .filter(item => item.completed)
                .map((item) => (
                  <ShoppingListItem
                    key={item.id}
                    item={item}
                    onToggle={handleToggleItem}
                    onRemove={handleRemoveItem}
                    theme={theme}
                  />
                ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};
const ShoppingListItem = ({ item, onToggle, onRemove, theme }) => {
  const styles = createStyles(theme);
  return (
    <View style={[
      styles.listItem,
      item.completed && styles.completedItem
    ]}>
      <TouchableOpacity
        style={styles.itemContent}
        onPress={() => onToggle(item.id)}
        activeOpacity={0.7}
      >
        <TouchableOpacity
          style={[
            styles.checkbox,
            item.completed && styles.checkedBox
          ]}
          onPress={() => onToggle(item.id)}
        >
          {item.completed && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </TouchableOpacity>
        <Text style={[
          styles.itemText,
          item.completed && styles.completedText
        ]}>
          {item.text}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove(item.id)}
      >
        <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );
};
const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    marginRight: 24,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 'auto',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    marginRight: 12,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  itemsList: {
    paddingVertical: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginVertical: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  completedItem: {
    opacity: 0.6,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkedBox: {
    backgroundColor: theme.colors.primary,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
});
export default ShoppingListModal;
