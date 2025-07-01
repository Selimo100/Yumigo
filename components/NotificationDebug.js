import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { createNotification } from '../services/notificationService';
import useAuth from '../lib/useAuth';

const NotificationDebug = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const [isCreating, setIsCreating] = useState(false);

  const createTestNotification = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    setIsCreating(true);
    try {
      await createNotification({
        type: 'test',
        recipientId: user.uid,
        senderId: user.uid,
        senderName: 'Test User',
        senderAvatar: null,
        title: '🧪 Test Notification',
        message: 'This is a test notification to check if the in-app notification system is working correctly.',
        actionUrl: '/home',
      });
      
      Alert.alert('Success', 'Test notification created! Check the notification bell on the home screen.');
    } catch (error) {
      console.error('Error creating test notification:', error);
      Alert.alert('Error', 'Failed to create test notification: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      margin: 16,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    label: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    value: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '600',
      flex: 1,
      textAlign: 'right',
      marginLeft: 12,
    },
    testButton: {
      backgroundColor: theme.colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    testButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    notificationsList: {
      maxHeight: 200,
      marginTop: 12,
    },
    notificationItem: {
      backgroundColor: theme.colors.background,
      padding: 8,
      borderRadius: 6,
      marginVertical: 2,
    },
    notificationText: {
      fontSize: 12,
      color: theme.colors.text,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔔 In-App Notification Debug</Text>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>User ID:</Text>
        <Text style={styles.value}>{user?.uid || 'Not logged in'}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Total Notifications:</Text>
        <Text style={styles.value}>{notifications.length}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Unread Count:</Text>
        <Text style={styles.value}>{unreadCount}</Text>
      </View>

      <TouchableOpacity 
        style={styles.testButton} 
        onPress={createTestNotification}
        disabled={isCreating}
      >
        <Text style={styles.testButtonText}>
          {isCreating ? 'Creating...' : 'Create Test Notification'}
        </Text>
      </TouchableOpacity>

      {notifications.length > 0 && (
        <ScrollView style={styles.notificationsList}>
          <Text style={[styles.label, { marginBottom: 8 }]}>Recent Notifications:</Text>
          {notifications.slice(0, 5).map((notification, index) => (
            <View key={notification.id} style={styles.notificationItem}>
              <Text style={styles.notificationText}>
                {index + 1}. {notification.title} - {notification.read ? 'Read' : 'Unread'}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default NotificationDebug;
