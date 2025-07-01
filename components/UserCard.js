import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import FollowButton from './FollowButton';

export default function UserCard({ 
  user, 
  onPress, 
  showFollowButton = true,
  onFollowChange 
}) {
  const { theme } = useTheme();

  if (!user) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity
        style={styles.userInfoContainer}
        onPress={() => onPress?.(user)}
      >
        <View style={styles.userInfo}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.colors.border }
            ]}
          >
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={24} color={theme.colors.textSecondary} />
            )}
          </View>

          <View style={styles.details}>
            <Text style={[styles.username, { color: theme.colors.text }]}>
              {user.username}
            </Text>
            <Text style={[styles.bio, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {user.bio || 'Food enthusiast'}
            </Text>
            <View style={styles.stats}>
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                {user.recipeCount || 0} recipes • {user.followerCount || 0} followers
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {showFollowButton && (
        <FollowButton
          userId={user.id}
          size="small"
          onFollowChange={onFollowChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfoContainer: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  details: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  bio: {
    fontSize: 13,
    marginBottom: 4,
  },
  stats: {
    flexDirection: 'row',
  },
  statText: {
    fontSize: 12,
  },
});
