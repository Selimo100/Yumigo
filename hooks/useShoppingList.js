import { useState, useEffect } from 'react';
import useAuth from '../lib/useAuth';
import {
  getShoppingList,
  addShoppingListItem,
  toggleShoppingListItem,
  removeShoppingListItem,
} from '../services/userService';

export const useShoppingList = () => {
  const { user } = useAuth();
  const [shoppingList, setShoppingList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadShoppingList = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      const list = await getShoppingList(user.uid);
      setShoppingList(list);
    } catch (error) {
      console.error('Error loading shopping list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (text) => {
    if (!user?.uid || !text.trim()) return;
    
    try {
      const newItem = await addShoppingListItem(user.uid, { text: text.trim() });
      setShoppingList(prev => [...prev, newItem]);
      return newItem;
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  };

  const toggleItem = async (itemId) => {
    if (!user?.uid) return;
    
    try {
      const updatedList = await toggleShoppingListItem(user.uid, itemId);
      setShoppingList(updatedList);
    } catch (error) {
      console.error('Error toggling item:', error);
      throw error;
    }
  };

  const removeItem = async (itemId) => {
    if (!user?.uid) return;
    
    try {
      const updatedList = await removeShoppingListItem(user.uid, itemId);
      setShoppingList(updatedList);
    } catch (error) {
      console.error('Error removing item:', error);
      throw error;
    }
  };

  const clearCompleted = async () => {
    if (!user?.uid) return;
    
    try {
      const completedItems = shoppingList.filter(item => item.completed);
      for (const item of completedItems) {
        await removeShoppingListItem(user.uid, item.id);
      }
      await loadShoppingList(); // Reload the list
    } catch (error) {
      console.error('Error clearing completed items:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadShoppingList();
  }, [user?.uid]);

  const completedCount = shoppingList.filter(item => item.completed).length;
  const pendingCount = shoppingList.filter(item => !item.completed).length;

  return {
    shoppingList,
    isLoading,
    addItem,
    toggleItem,
    removeItem,
    clearCompleted,
    refreshList: loadShoppingList,
    completedCount,
    pendingCount,
    totalCount: shoppingList.length,
  };
};
