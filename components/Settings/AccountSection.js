import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const AccountSection = ({ styles, theme }) => {
  return (
    <>
      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>Change Password</Text>
          <Text style={styles.settingSubtitle}>Update your account password</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>Export Data</Text>
          <Text style={styles.settingSubtitle}>Download your recipes and data</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.settingItem, styles.dangerItem]}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, styles.dangerText]}>Delete Account</Text>
          <Text style={styles.settingSubtitle}>Permanently delete your account</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#DC3545" />
      </TouchableOpacity>
    </>
  );
};
