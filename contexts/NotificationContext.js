// Notification Context - Verwaltung von In-App-Benachrichtigungen und Push-Notifications
import { createContext, useContext, useEffect, useState } from 'react';
import { collection, doc, onSnapshot, query, updateDoc, where, writeBatch } from 'firebase/firestore';
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

  // Wird ausgeführt wenn sich user?.uid ändert (Login/Logout)
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Loading State aktivieren während Daten geladen werden
    setIsLoading(true);

    // Zeigt auf die 'notifications' Collection in Firebase
    const notificationsRef = collection(db, 'notifications');

    // Filtert Notifications: Nur die für den aktuellen User bestimmten
    const q = query(
      notificationsRef,
      where('recipientId', '==', user.uid) // recipientId muss user.uid entsprechen
    );

    // onSnapshot = Firebase's Real-time Listener
    // Reagiert automatisch auf Änderungen in der Firestore Collection
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsList = []; // temp Array für alle Notifications
      let unreadCounter = 0; // ungelesene Notifications

      // snapshot.docs = Array aller Dokumente die der Query entsprechen
      snapshot.docs.forEach(doc => {
        // doc.id = Firestore Document ID
        // doc.data() = Alle Felder des Dokuments als Objekt
        const data = { id: doc.id, ...doc.data() };
        notificationsList.push(data);

        // Prüft ob Notification als ungelesen markiert ist
        if (!data.read) {
          unreadCounter++;
        }
      });

      // Sortiert nach createdAt Timestamp (Firestore Timestamp)
      notificationsList.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });

      // updates
      setNotifications(notificationsList); // Alle Notifications
      setUnreadCount(unreadCounter); // Badge-Zähler
      setIsLoading(false); // Loading beenden
    }, (error) => {
      console.error('Notification listener error:', error);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  const markAsRead = async (notificationId) => {
    try {
      // UI aktualisieren live
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      setUnreadCount(prevCount => Math.max(0, prevCount - 1));

      // Firebase Update
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      // Error handling
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(notification => !notification.read);

      if (unreadNotifications.length === 0) {
        return true;
      }

      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({
          ...notification,
          read: true
        }))
      );
      setUnreadCount(0);
      // Batch-Write für Performance => mehrere Schreibvorgänge zu einem einzigen Request kombiniert.
      const batch = writeBatch(db);

      unreadNotifications.forEach(notification => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.update(notificationRef, { read: true });
      });

      await batch.commit(); // Alle Updates in einem Batch
      return true;
    } catch (error) {

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
