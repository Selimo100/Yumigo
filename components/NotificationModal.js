import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { router } from 'expo-router';
const NotificationModal = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    getNotificationIcon,
    getNotificationColor,
  } = useNotifications();
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = React.useState(false);
  const styles = createStyles(theme);
  const formatTime = (timestamp) => {
    try {
      const date = timestamp?.toDate?.() || new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return 'just now';
    }
  };
  const handleNotificationPress = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      onClose();
      router.push(notification.actionUrl);
    }
  };
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }
    try {
      setIsMarkingAllAsRead(true);
      await markAllAsRead();
    } catch (error) {
      alert('Failed to mark notifications as read. Please try again.');
    } finally {
      setIsMarkingAllAsRead(false);
    }
  };
  const renderNotificationItem = (notification) => {
    const iconColor = getNotificationColor(notification.type);
    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationItem,
          !notification.read && styles.unreadNotification
        ]}
        onPress={() => handleNotificationPress(notification)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <View style={styles.avatarContainer}>
            {notification.senderAvatar ? (
              <Image 
                source={{ uri: notification.senderAvatar }} 
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: iconColor + '20' }]}>
                <Ionicons 
                  name="person" 
                  size={20} 
                  color={iconColor} 
                />
              </View>
            )}
            <View style={[styles.notificationIcon, { backgroundColor: iconColor }]}>
              <Ionicons 
                name={getNotificationIcon(notification.type)} 
                size={12} 
                color="#FFFFFF" 
              />
            </View>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.notificationTitle}>
              {notification.title}
            </Text>
            <Text style={styles.notificationMessage}>
              {notification.message}
            </Text>
            <Text style={styles.notificationTime}>
              {formatTime(notification.createdAt)}
            </Text>
          </View>
          {!notification.read && (
            <View style={styles.unreadDot} />
          )}
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={[
                  styles.markAllButton, 
                  isMarkingAllAsRead && styles.markAllButtonDisabled
                ]}
                onPress={handleMarkAllAsRead}
                activeOpacity={0.7}
                disabled={isMarkingAllAsRead}
              >
                <Text style={styles.markAllText}>
                  {isMarkingAllAsRead ? 'Marking...' : 'Mark all read'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        {}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons 
                name="notifications-outline" 
                size={64} 
                color={theme.colors.textSecondary} 
              />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySubtitle}>
                You'll see notifications when someone likes, comments, or follows you!
              </Text>
            </View>
          ) : (
            <View style={styles.notificationsList}>
              {notifications.map(renderNotificationItem)}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.primary + '15',
  },
  markAllButtonDisabled: {
    backgroundColor: theme.colors.textSecondary + '15',
    opacity: 0.6,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  notificationsList: {
    paddingVertical: 8,
  },
  notificationItem: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  unreadNotification: {
    backgroundColor: theme.colors.primary + '08',
    borderColor: theme.colors.primary + '20',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: 8,
    marginTop: 4,
  },
});
export default NotificationModal;
