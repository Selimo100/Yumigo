import React from 'react';
import { TouchableOpacity, View, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../lib/firebaseconfig';
import { sendPasswordResetEmail } from 'firebase/auth';

export const AccountSection = ({ styles, theme }) => {
  
  const handleChangePassword = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email) {
        await sendPasswordResetEmail(auth, currentUser.email);
        Alert.alert(
          'Password Reset',
          'A password reset email has been sent to your email address.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send password reset email.');
    }
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This feature will be available soon. You will be able to download all your recipes and data.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Coming Soon',
              'Account deletion will be implemented in a future update.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  return (
    <>
      <TouchableOpacity style={styles.settingItem} onPress={handleChangePassword}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>Change Password</Text>
          <Text style={styles.settingSubtitle}>Update your account password</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>Export Data</Text>
          <Text style={styles.settingSubtitle}>Download your recipes and data</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.settingItem, styles.dangerItem]} onPress={handleDeleteAccount}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, styles.dangerText]}>Delete Account</Text>
          <Text style={styles.settingSubtitle}>Permanently delete your account</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#DC3545" />
      </TouchableOpacity>
    </>
  );
};
