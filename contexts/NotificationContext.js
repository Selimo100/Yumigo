import React, { createContext, useContext, useState, useEffect } from 'react';
import { onSnapshot, collection, query, where, orderBy, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebaseconfig';
import useAuth from '../lib/useAuth';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setIsLoading(true);
    console.log('Setting up notifications listener for user:', user.uid);

    // Listen to real-time notifications
    const notificationsRef = collection(db, 'notifications');
    
    // Simplified query without ordering until index is created
    const q = query(
      notificationsRef,
      where('recipientId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Notifications snapshot received, docs count:', snapshot.docs.length);
      
      const notificationsList = [];
      let unreadCounter = 0;

      snapshot.docs.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        notificationsList.push(data);
        
        if (!data.read) {
          unreadCounter++;
        }
      });

      // Sort notifications manually by creation date (newest first)
      notificationsList.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });

      console.log('Processed notifications:', notificationsList.length, 'unread:', unreadCounter);
      setNotifications(notificationsList);
      setUnreadCount(unreadCounter);
      setIsLoading(false);
    }, (error) => {
      console.error('Error in notifications listener:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const markAsRead = async (notificationId) => {
    try {
      // Immediately update local state for instant UI feedback
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      
      // Update Firestore
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      // The onSnapshot listener will restore correct state on error
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(notification => !notification.read);
      
      if (unreadNotifications.length === 0) {
        return true; // Success, nothing to do
      }
      
      // Immediately update local state for instant UI feedback
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({
          ...notification,
          read: true
        }))
      );
      setUnreadCount(0);
      
      // Use batch write for better performance
      const batch = writeBatch(db);
      
      unreadNotifications.forEach(notification => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.update(notificationRef, { read: true });
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      // Revert local state on error by reloading from Firestore
      // The onSnapshot listener will automatically restore the correct state
      throw error;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return 'heart';
      case 'comment':
        return 'chatbubble';
      case 'follow':
        return 'person-add';
      case 'recipe':
        return 'restaurant';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'like':
        return '#FF6B6B';
      case 'comment':
        return '#4ECDC4';
      case 'follow':
        return '#45B7D1';
      case 'recipe':
        return '#FFA726';
      default:
        return '#6C5CE7';
    }
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    getNotificationIcon,
    getNotificationColor,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
