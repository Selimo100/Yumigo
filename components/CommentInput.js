import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Keyboard, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserProfile } from '../hooks/useUserProfile';

export const CommentInput = ({ onAddComment, theme }) => {
  const [newComment, setNewComment] = useState('');
  const [inputHeight, setInputHeight] = useState(40);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const inputRef = useRef(null);
  const insets = useSafeAreaInsets();
  const { profile: userProfile } = useUserProfile();

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardVisible(true);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const styles = StyleSheet.create({
    commentInputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingBottom: isKeyboardVisible ? 12 : Math.max(12, insets.bottom),
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      gap: 12,
      minHeight: 64,
      position: 'absolute',
      bottom: isKeyboardVisible ? keyboardHeight : 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    },
    userAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.button,
      marginBottom: 4,
    },
    inputContainer: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      maxHeight: 120,
    },
    commentInput: {
      fontSize: 16,
      color: theme.colors.text,
      textAlignVertical: 'top',
      minHeight: 24,
    },
    actionButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    postButton: {
      padding: 8,
    },
    postButtonText: {
      color: '#4A90E2',
      fontSize: 16,
      fontWeight: '600',
    },
    dismissButton: {
      padding: 8,
    },
  });

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
      setInputHeight(40);
      inputRef.current?.blur();
    }
  };

  const handleContentSizeChange = (event) => {
    const height = Math.max(24, Math.min(96, event.nativeEvent.contentSize.height));
    setInputHeight(height);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    inputRef.current?.blur();
  };    return (
    <View style={styles.commentInputContainer}>
      <View style={styles.userAvatar}>
        {userProfile?.avatar ? (
          <Image source={{ uri: userProfile.avatar }} style={styles.userAvatar} />
        ) : (
          <View style={[styles.userAvatar, { alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="person" size={16} color={theme.colors.textSecondary} />
          </View>
        )}
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[styles.commentInput, { height: Math.max(24, inputHeight) }]}
          placeholder="Add a comment..."
          placeholderTextColor={theme.colors.textSecondary}
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={500}
          onContentSizeChange={handleContentSizeChange}
          scrollEnabled={inputHeight >= 96}
        />
      </View>

      <View style={styles.actionButtons}>
        {newComment.trim() ? (
          <>
            <TouchableOpacity onPress={dismissKeyboard} style={styles.dismissButton}>
              <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAddComment} style={styles.postButton}>
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={dismissKeyboard} style={styles.postButton}>
            <Ionicons name="send-outline" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};