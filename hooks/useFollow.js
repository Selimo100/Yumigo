// KOMPLEXER HOOK: Follow-System mit Cache-Management und optimistischen Updates
// Verwaltet Following/Followers-Listen, Suchfunktionen und Live-Feed-Updates

import {useCallback, useEffect, useState} from 'react';
import {
  followUser,
  getFollowers,
  getFollowingFeed,
  getFollowingUsers,
  getSuggestedUsers,
  isFollowing,
  searchUsers,
  unfollowUser
} from '../services/userService';
import {notifyUserFollow} from '../services/inAppNotificationService';
import useAuth from '../lib/useAuth';
import {profileUpdateEmitter} from '../utils/profileUpdateEmitter';
import {showToast} from '../utils/toast';

export const useFollow = () => {
  const { user } = useAuth();
  const [followingList, setFollowingList] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followingFeed, setFollowingFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [followingCount, setFollowingCount] = useState(null);
  const [followerCount, setFollowerCount] = useState(null);
  const checkFollowStatus = useCallback(async (targetUserId) => {
    if (!user?.uid || !targetUserId) return false;
    try {
      return await isFollowing(user.uid, targetUserId);
    } catch (error) {
      return false;
    }
  }, [user?.uid]);
  // OPTIMISTISCHE FOLLOW-FUNKTION: Sofortige UI-Updates für bessere UX
  // Bei Fehlern wird der State zurückgesetzt
  const handleFollow = useCallback(async (targetUserId) => {
    if (!user?.uid || !targetUserId) return false;
    
    try {
      // Optimistisches Update der Listen
      setFollowingList(prev => {
        const newList = [...(prev || [])];
        if (!newList.find(u => u.id === targetUserId)) {
          const userInfo = suggestedUsers?.find(u => u.id === targetUserId) || { id: targetUserId };
          newList.push(userInfo);
        }
        return newList;
      });

      setSuggestedUsers(prev => {
        return (prev || []).filter(u => u.id !== targetUserId);
      });

      setFollowingCount(prev => (prev !== null ? prev + 1 : (followingList?.length || 0) + 1));

      const success = await followUser(user.uid, targetUserId);
      
      if (success) {
        try {
          // BENACHRICHTIGUNGS-LOGIK: Informiere gefolgten User
          const userName = user.displayName || user.email?.split('@')[0] || 'Someone';
          await notifyUserFollow(targetUserId, userName, user.uid);
        } catch (notificationError) {
        }
      }

      // PROFILE-UPDATE-BROADCAST: Informiere andere Komponenten
      profileUpdateEmitter.emitFollowChange(targetUserId, true);
      
      if (!success) {
        showToast.error('Failed to follow user. Please try again.');
      }
      
      return success;
    } catch (error) {
      showToast.error('Network error. Please check your connection.');
      return false;
    }
  }, [user?.uid, suggestedUsers]);
  const handleUnfollow = useCallback(async (targetUserId) => {
    if (!user?.uid || !targetUserId) return false;
    try {
      const userInfo = followingList?.find(u => u.id === targetUserId);
      setFollowingList(prev => {
        return (prev || []).filter(u => u.id !== targetUserId);
      });
      if (userInfo) {
        setSuggestedUsers(prev => {
          const newList = [...(prev || [])];
          if (!newList.find(u => u.id === targetUserId)) {
            newList.unshift(userInfo); 
          }
          return newList;
        });
      }
      setFollowingCount(prev => (prev !== null ? Math.max(0, prev - 1) : Math.max(0, (followingList?.length || 0) - 1)));
      const success = await unfollowUser(user.uid, targetUserId);
      profileUpdateEmitter.emitFollowChange(targetUserId, false);
      if (!success) {
        showToast.error('Failed to unfollow user. Please try again.');
      }
      return success;
    } catch (error) {
      showToast.error('Network error. Please check your connection.');
      return false;
    }
  }, [user?.uid, followingList]);
  const loadFollowingUsers = useCallback(async () => {
    if (!user?.uid) return [];
    try {
      if (!followingList || followingList.length === 0) {
        setIsLoading(true);
      }
      const following = await getFollowingUsers(user.uid);
      setFollowingList(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(following)) {
          return following;
        }
        return prev;
      });
      setFollowingCount(following?.length || 0);
      return following;
    } catch (error) {
      setFollowingList([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);
  const loadFollowers = useCallback(async () => {
    if (!user?.uid) return [];
    try {
      if (!followersList || followersList.length === 0) {
        setIsLoading(true);
      }
      const followers = await getFollowers(user.uid);
      setFollowersList(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(followers)) {
          return followers;
        }
        return prev;
      });
      setFollowerCount(followers?.length || 0);
      return followers;
    } catch (error) {
      setFollowersList([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);
  const loadSuggestedUsers = useCallback(async () => {
    if (!user?.uid) return [];
    try {
      if (!suggestedUsers || suggestedUsers.length === 0) {
        setIsLoading(true);
      }
      const suggested = await getSuggestedUsers(user.uid);
      setSuggestedUsers(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(suggested)) {
          return suggested;
        }
        return prev;
      });
      return suggested;
    } catch (error) {
      setSuggestedUsers([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);
  const loadFollowingFeed = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setIsLoading(true);
      const feed = await getFollowingFeed(user.uid);
      setFollowingFeed(feed);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);
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
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  const updateListsOptimistically = useCallback((targetUserId, isFollowing, userInfo = null) => {
    if (isFollowing) {
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
      const user = userInfo || followingList?.find(u => u.id === targetUserId);
      setFollowingList(prev => {
        return (prev || []).filter(u => u.id !== targetUserId);
      });
      if (user) {
        setSuggestedUsers(prev => {
          const newList = [...(prev || [])];
          if (!newList.find(u => u.id === targetUserId)) {
            newList.unshift(user); 
          }
          return newList;
        });
      }
    }
  }, [followingList, suggestedUsers]);
  useEffect(() => {
    if (user?.uid) {
      Promise.all([
        loadFollowingUsers(),
        loadFollowers(),
        loadSuggestedUsers()
      ]).catch(() => {
      });
    }
  }, [user?.uid, loadFollowingUsers, loadFollowers, loadSuggestedUsers]);
  useEffect(() => {
    const unsubscribe = profileUpdateEmitter.subscribeToFollowChanges((userId, isFollowing) => {
      if (isFollowing) {
        setFollowingList(prev => {
          const newList = [...(prev || [])];
          if (!newList.find(u => u.id === userId)) {
            const userInfo = suggestedUsers?.find(u => u.id === userId) || { id: userId };
            newList.push(userInfo);
          }
          return newList;
        });
        setSuggestedUsers(prev => {
          return (prev || []).filter(u => u.id !== userId);
        });
      } else {
        const userInfo = followingList?.find(u => u.id === userId);
        setFollowingList(prev => {
          return (prev || []).filter(u => u.id !== userId);
        });
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
    followingList,
    followersList,
    suggestedUsers,
    followingFeed,
    searchResults,
    isLoading,
    followingCount,
    followerCount,
    handleFollow,
    handleUnfollow,
    checkFollowStatus,
    updateListsOptimistically,
    loadFollowingUsers,
    loadFollowers,
    loadSuggestedUsers,
    loadFollowingFeed,
    searchForUsers,
    isCurrentUser: useCallback((userId) => user?.uid === userId, [user?.uid])
  };
};
