import React from 'react';
import { View, Text, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const SettingItem = ({ 
  title, 
  subtitle, 
  value, 
  onValueChange, 
  styles, 
  theme, 
  type = 'switch' 
}) => (
  <View style={styles.settingItem}>
    <View style={styles.settingInfo}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    {type === 'switch' && (
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor={value ? '#FFFFFF' : theme.colors.textSecondary}
      />
    )}
    {type === 'chevron' && (
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    )}
  </View>
);

export const Section = ({ title, styles, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);
