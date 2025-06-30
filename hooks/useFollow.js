import { useState, useEffect, useCallback } from 'react';
import {
  followUser,
  unfollowUser,
  isFollowing,
  getFollowingUsers,
  getFollowers,
  getSuggestedUsers,
  searchUsers,
  getFollowingFeed
} from '../services/userService';
import useAuth from '../lib/useAuth';
import { profileUpdateEmitter } from '../utils/profileUpdateEmitter';
import { showToast } from '../utils/toast';

export const useFollow = () => {
  const { user } = useAuth();
  const [followingList, setFollowingList] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followingFeed, setFollowingFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
  // Local follow counts for immediate UI updates
  const [followingCount, setFollowingCount] = useState(null);
  const [followerCount, setFollowerCount] = useState(null);

  // Check if current user follows target user
  const checkFollowStatus = useCallback(async (targetUserId) => {
    if (!user?.uid || !targetUserId) return false;
    try {
      return await isFollowing(user.uid, targetUserId);
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  }, [user?.uid]);

  // Follow a user
  const handleFollow = useCallback(async (targetUserId) => {
    if (!user?.uid || !targetUserId) return false;
    try {
      // Optimistically update lists immediately (never revert these)
      setFollowingList(prev => {
        const newList = [...(prev || [])];
        if (!newList.find(u => u.id === targetUserId)) {
          // Try to find the user in suggested users to get full info
          const userInfo = suggestedUsers?.find(u => u.id === targetUserId) || { id: targetUserId };
          newList.push(userInfo);
        }
        return newList;
      });
      
      // Remove from suggested users immediately
      setSuggestedUsers(prev => {
        return (prev || []).filter(u => u.id !== targetUserId);
      });
      
      // Update following count optimistically
      setFollowingCount(prev => (prev !== null ? prev + 1 : (followingList?.length || 0) + 1));
      
      const success = await followUser(user.uid, targetUserId);
      
      // Always emit follow change event and trigger profile update
      profileUpdateEmitter.emitFollowChange(targetUserId, true);
      
      if (!success) {
        console.warn('Follow action failed in backend, but UI remains updated');
        // Show a toast or error message here if needed, but don't revert UI
        showToast.error('Failed to follow user. Please try again.');
      }
      
      return success;
    } catch (error) {
      console.error('Error following user:', error);
      // Show error message but don't revert the optimistic UI update
      console.warn('Follow action failed due to error, but UI remains updated');
      showToast.error('Network error. Please check your connection.');
      return false;
    }
  }, [user?.uid, suggestedUsers]);

  // Unfollow a user
  const handleUnfollow = useCallback(async (targetUserId) => {
    if (!user?.uid || !targetUserId) return false;
    try {
      // Get user info before removing from following list
      const userInfo = followingList?.find(u => u.id === targetUserId);
      
      // Optimistically update lists immediately (never revert these)
      setFollowingList(prev => {
        return (prev || []).filter(u => u.id !== targetUserId);
      });
      
      // Add back to suggested users immediately if we have user info
      if (userInfo) {
        setSuggestedUsers(prev => {
          const newList = [...(prev || [])];
          if (!newList.find(u => u.id === targetUserId)) {
            newList.unshift(userInfo); // Add to beginning of suggested list
          }
          return newList;
        });
      }
      
      // Update following count optimistically
      setFollowingCount(prev => (prev !== null ? Math.max(0, prev - 1) : Math.max(0, (followingList?.length || 0) - 1)));
      
      const success = await unfollowUser(user.uid, targetUserId);
      
      // Always emit follow change event and trigger profile update
      profileUpdateEmitter.emitFollowChange(targetUserId, false);
      
      if (!success) {
        console.warn('Unfollow action failed in backend, but UI remains updated');
        // Show a toast or error message here if needed, but don't revert UI
        showToast.error('Failed to unfollow user. Please try again.');
      }
      
      return success;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      // Show error message but don't revert the optimistic UI update
      console.warn('Unfollow action failed due to error, but UI remains updated');
      showToast.error('Network error. Please check your connection.');
      return false;
    }
  }, [user?.uid, followingList]);

  // Load users that current user is following
  const loadFollowingUsers = useCallback(async () => {
    if (!user?.uid) return [];
    try {
      // Only show loading if we don't have any data yet
      if (!followingList || followingList.length === 0) {
        setIsLoading(true);
      }
      const following = await getFollowingUsers(user.uid);
      
      // Only update if data actually changed
      setFollowingList(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(following)) {
          return following;
        }
        return prev;
      });
      
      // Update following count
      setFollowingCount(following?.length || 0);
      
      return following;
    } catch (error) {
      console.error('Error loading following users:', error);
      setFollowingList([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Load followers of current user
  const loadFollowers = useCallback(async () => {
    if (!user?.uid) return [];
    try {
      // Only show loading if we don't have any data yet
      if (!followersList || followersList.length === 0) {
        setIsLoading(true);
      }
      const followers = await getFollowers(user.uid);
      
      // Only update if data actually changed
      setFollowersList(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(followers)) {
          return followers;
        }
        return prev;
      });
      
      // Update follower count
      setFollowerCount(followers?.length || 0);
      
      return followers;
    } catch (error) {
      console.error('Error loading followers:', error);
      setFollowersList([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Load suggested users to follow
  const loadSuggestedUsers = useCallback(async () => {
    if (!user?.uid) return [];
    try {
      // Only show loading if we don't have any data yet
      if (!suggestedUsers || suggestedUsers.length === 0) {
        setIsLoading(true);
      }
      const suggested = await getSuggestedUsers(user.uid);
      
      // Only update if data actually changed
      setSuggestedUsers(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(suggested)) {
          return suggested;
        }
        return prev;
      });
      
      return suggested;
    } catch (error) {
      console.error('Error loading suggested users:', error);
      setSuggestedUsers([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Load feed from followed users
  const loadFollowingFeed = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setIsLoading(true);
      const feed = await getFollowingFeed(user.uid);
      setFollowingFeed(feed);
    } catch (error) {
      console.error('Error loading following feed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Search for users
  const searchForUsers = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setIsLoading(true);
      const results = await searchUsers(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle optimistic follow/unfollow list updates
  const updateListsOptimistically = useCallback((targetUserId, isFollowing, userInfo = null) => {
    if (isFollowing) {
      // User was followed - add to following, remove from suggested
      setFollowingList(prev => {
        const newList = [...(prev || [])];
        if (!newList.find(u => u.id === targetUserId)) {
          const user = userInfo || suggestedUsers?.find(u => u.id === targetUserId) || { id: targetUserId };
          newList.push(user);
        }
        return newList;
      });
      
      setSuggestedUsers(prev => {
        return (prev || []).filter(u => u.id !== targetUserId);
      });
    } else {
      // User was unfollowed - remove from following, add to suggested
      const user = userInfo || followingList?.find(u => u.id === targetUserId);
      
      setFollowingList(prev => {
        return (prev || []).filter(u => u.id !== targetUserId);
      });
      
      if (user) {
        setSuggestedUsers(prev => {
          const newList = [...(prev || [])];
          if (!newList.find(u => u.id === targetUserId)) {
            newList.unshift(user); // Add to beginning
          }
          return newList;
        });
      }
    }
  }, [followingList, suggestedUsers]);

  // Initialize data on mount
  useEffect(() => {
    if (user?.uid) {
      // Load all follow data when user is available
      Promise.all([
        loadFollowingUsers(),
        loadFollowers(),
        loadSuggestedUsers()
      ]).catch(error => {
        console.error('Error loading initial follow data:', error);
      });
    }
  }, [user?.uid, loadFollowingUsers, loadFollowers, loadSuggestedUsers]);

  // Listen for follow changes from other parts of the app
  useEffect(() => {
    const unsubscribe = profileUpdateEmitter.subscribeToFollowChanges((userId, isFollowing) => {
      // Update our local state when follow status changes elsewhere in the app
      if (isFollowing) {
        // User was followed - add to following list if not already there
        setFollowingList(prev => {
          const newList = [...(prev || [])];
          if (!newList.find(u => u.id === userId)) {
            // Try to find user info from suggested users or create minimal entry
            const userInfo = suggestedUsers?.find(u => u.id === userId) || { id: userId };
            newList.push(userInfo);
          }
          return newList;
        });
        
        // Remove from suggested users
        setSuggestedUsers(prev => {
          return (prev || []).filter(u => u.id !== userId);
        });
      } else {
        // User was unfollowed - remove from following list
        const userInfo = followingList?.find(u => u.id === userId);
        
        setFollowingList(prev => {
          return (prev || []).filter(u => u.id !== userId);
        });
        
        // Add back to suggested users if we have user info
        if (userInfo) {
          setSuggestedUsers(prev => {
            const newList = [...(prev || [])];
            if (!newList.find(u => u.id === userId)) {
              newList.unshift(userInfo);
            }
            return newList;
          });
        }
      }
    });

    return unsubscribe;
  }, [followingList, suggestedUsers]);

  return {
    // State
    followingList,
    followersList,
    suggestedUsers,
    followingFeed,
    searchResults,
    isLoading,
    
    // Counts
    followingCount,
    followerCount,
    
    // Actions
    handleFollow,
    handleUnfollow,
    checkFollowStatus,
    updateListsOptimistically,
    loadFollowingUsers,
    loadFollowers,
    loadSuggestedUsers,
    loadFollowingFeed,
    searchForUsers,
    
    // Helper
    isCurrentUser: useCallback((userId) => user?.uid === userId, [user?.uid])
  };
};
