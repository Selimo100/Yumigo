// KOMPLEXE KOMPONENTE: Follow/Unfollow Button mit optimistischen Updates
// Verwaltet Follow-Status, Benachrichtigungen und Error-Handling

import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../contexts/ThemeContext';
import {useFollow} from '../hooks/useFollow';
import {notifyUserFollow} from '../services/inAppNotificationService';
import {showToast} from '../utils/toast';
import useAuth from '../lib/useAuth';

export default function FollowButton({
  userId,
  size = 'medium',
  style,
  onFollowChange
}) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { handleFollow, handleUnfollow, checkFollowStatus, isCurrentUser } = useFollow();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const checkStatus = async () => {
      if (userId) {
        const status = await checkFollowStatus(userId);
        setIsFollowing(status);
      }
    };
    checkStatus();
  }, [userId, checkFollowStatus]);
  // OPTIMISTISCHE UI-UPDATES: Sofortige Anzeige für bessere UX
  // Bei Fehlern wird der Status zurückgesetzt
  const handlePress = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const previousStatus = isFollowing;
    const newStatus = !isFollowing;

    // Optimistisches Update der UI
    setIsFollowing(newStatus);
    onFollowChange?.(newStatus);

    try {
      let success;
      if (previousStatus) {
        success = await handleUnfollow(userId);
      } else {
        success = await handleFollow(userId);

        // BENACHRICHTIGUNGS-SYSTEM: Informiere gefolgten User
        // Wird ausgelöst wenn User einem anderen folgt
        if (success && !previousStatus && user) {
          notifyUserFollow(userId, user.displayName || user.email?.split('@')[0] || 'Someone', user.uid);
        }
      }

      if (!success) {
        showToast.error(previousStatus ? 'Failed to unfollow user' : 'Failed to follow user');
      }
    } catch (error) {
      showToast.error('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };
  if (isCurrentUser(userId)) {
    return null;
  }
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { width: 80, height: 32, fontSize: 12, iconSize: 14 };
      case 'large':
        return { width: 120, height: 44, fontSize: 16, iconSize: 18 };
      default:
        return { width: 100, height: 36, fontSize: 14, iconSize: 16 };
    }
  };
  const buttonSize = getButtonSize();
  return (
    <TouchableOpacity
      style={[
        styles.followButton,
        {
          backgroundColor: isFollowing ? theme.colors.surface : theme.colors.primary,
          borderColor: theme.colors.primary,
          width: buttonSize.width,
          height: buttonSize.height,
        },
        style
      ]}
      onPress={handlePress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={isFollowing ? theme.colors.primary : '#FFFFFF'}
        />
      ) : (
        <>
          <Ionicons
            name={isFollowing ? "person-remove" : "person-add"}
            size={buttonSize.iconSize}
            color={isFollowing ? theme.colors.primary : '#FFFFFF'}
            style={styles.icon}
          />
          <Text
            style={[
              styles.buttonText,
              {
                color: isFollowing ? theme.colors.primary : '#FFFFFF',
                fontSize: buttonSize.fontSize,
              }
            ]}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 4,
  },
  buttonText: {
    fontWeight: '600',
  },
});
