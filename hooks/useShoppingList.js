// HOOK: Einkaufslisten-Management mit lokaler State-Synchronisation
// Verwaltet CRUD-Operationen und Error-Handling für Einkaufslisten

import { useState, useEffect, useCallback } from 'react';
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
  const [isLoading, setIsLoading] = useState(true); 
  const loadShoppingList = useCallback(async () => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const list = await getShoppingList(user.uid);
      const safeList = Array.isArray(list) ? list : [];
      setShoppingList(safeList);
    } catch (error) {
      setShoppingList([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);
  const addItem = async (text) => {
    if (!user?.uid || !text.trim()) return;
    try {
      const newItem = await addShoppingListItem(user.uid, { text: text.trim() });
      setShoppingList(prev => [...prev, newItem]);
      return newItem;
    } catch (error) {
      throw error;
    }
  };
  const toggleItem = async (itemId) => {
    if (!user?.uid) return;
    try {
      const updatedList = await toggleShoppingListItem(user.uid, itemId);
      setShoppingList(updatedList);
    } catch (error) {
      throw error;
    }
  };
  const removeItem = async (itemId) => {
    if (!user?.uid) return;
    try {
      const updatedList = await removeShoppingListItem(user.uid, itemId);
      setShoppingList(updatedList);
    } catch (error) {
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
      await loadShoppingList();
    } catch (error) {
      throw error;
    }
  };
  useEffect(() => {
    if (user?.uid) {
      loadShoppingList();
    } else {
      setShoppingList([]);
      setIsLoading(false);
    }
  }, [loadShoppingList]); 
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
