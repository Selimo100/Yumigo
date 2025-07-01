import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useFollow } from '../../hooks/useFollow';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import UserCard from '../../components/UserCard';

export default function FollowListScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { type = 'following' } = useLocalSearchParams(); // 'following' or 'followers'
  const {
    followingList,
    followersList,
    suggestedUsers,
    searchResults,
    isLoading,
    updateListsOptimistically,
    loadFollowingUsers,
    loadFollowers,
    loadSuggestedUsers,
    searchForUsers,
  } = useFollow();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(type);
  const [dataLoaded, setDataLoaded] = useState({
    following: false,
    followers: false,
    suggested: false
  });

  // Load data intelligently - only if not already loaded
  useEffect(() => {
    if (activeTab === 'following' && !dataLoaded.following) {
      loadFollowingUsers().then(() => {
        setDataLoaded(prev => ({ ...prev, following: true }));
      });
    } else if (activeTab === 'followers' && !dataLoaded.followers) {
      loadFollowers().then(() => {
        setDataLoaded(prev => ({ ...prev, followers: true }));
      });
    } else if (activeTab === 'suggested' && !dataLoaded.suggested) {
      loadSuggestedUsers().then(() => {
        setDataLoaded(prev => ({ ...prev, suggested: true }));
      });
    }
  }, [activeTab, dataLoaded]);

  // Refresh data when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      // Silently refresh the data for the current tab when screen comes into focus
      if (activeTab === 'following') {
        loadFollowingUsers();
      } else if (activeTab === 'followers') {
        loadFollowers();
      } else if (activeTab === 'suggested') {
        loadSuggestedUsers();
      }
    }, [activeTab, loadFollowingUsers, loadFollowers, loadSuggestedUsers])
  );

  useEffect(() => {
    if (searchTerm.trim()) {
      searchForUsers(searchTerm);
    }
  }, [searchTerm, searchForUsers]);

  const getData = () => {
    if (searchTerm.trim()) {
      return searchResults || [];
    }
    
    switch (activeTab) {
      case 'following':
        return followingList || [];
      case 'followers':
        return followersList || [];
      case 'suggested':
        return suggestedUsers || [];
      default:
        return [];
    }
  };

  const getTitle = () => {
    if (searchTerm.trim()) {
      return `Search Results (${searchResults?.length || 0})`;
    }
    
    switch (activeTab) {
      case 'following':
        return `Following (${followingList?.length || 0})`;
      case 'followers':
        return `Followers (${followersList?.length || 0})`;
      case 'suggested':
        return 'Discover People';
      default:
        return 'Users';
    }
  };

  const handleUserPress = (user) => {
    // Navigate to user profile (you can implement this later)
    console.log('Navigate to user profile:', user.id);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {getTitle()}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.colors.border }]}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search users..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {!searchTerm.trim() && (
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'following' && { backgroundColor: theme.colors.button }
            ]}
            onPress={() => setActiveTab('following')}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'following' 
                    ? theme.colors.buttonText 
                    : theme.colors.textSecondary
                }
              ]}
            >
              Following
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'followers' && { backgroundColor: theme.colors.button }
            ]}
            onPress={() => setActiveTab('followers')}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'followers' 
                    ? theme.colors.buttonText 
                    : theme.colors.textSecondary
                }
              ]}
            >
              Followers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'suggested' && { backgroundColor: theme.colors.button }
            ]}
            onPress={() => setActiveTab('suggested')}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'suggested' 
                    ? theme.colors.buttonText 
                    : theme.colors.textSecondary
                }
              ]}
            >
              Discover
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="people-outline" 
        size={64} 
        color={theme.colors.textSecondary} 
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        {searchTerm.trim() ? 'No users found' : getEmptyMessage()}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        {searchTerm.trim() 
          ? 'Try a different search term' 
          : getEmptySubMessage()
        }
      </Text>
    </View>
  );

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'following':
        return 'Not following anyone yet';
      case 'followers':
        return 'No followers yet';
      case 'suggested':
        return 'No suggestions available';
      default:
        return 'No users found';
    }
  };

  const getEmptySubMessage = () => {
    switch (activeTab) {
      case 'following':
        return 'Discover and follow other food enthusiasts';
      case 'followers':
        return 'Share your recipes to gain followers';
      case 'suggested':
        return 'Check back later for recommendations';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={getData()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            onPress={handleUserPress}
            showFollowButton={true}
            onFollowChange={(isNowFollowing) => {
              // Immediately update the lists optimistically
              updateListsOptimistically(item.id, isNowFollowing, item);
              console.log('Follow status changed for user:', item.id, 'Now following:', isNowFollowing);
            }}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        contentContainerStyle={getData().length === 0 ? styles.emptyListContainer : null}
        showsVerticalScrollIndicator={false}
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.button} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
});
