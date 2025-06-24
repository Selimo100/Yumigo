import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export default function TimePicker({ time, onTimeChange, error }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const decreaseTime = () => {
    if (time > 1) {
      onTimeChange(time - 1);
    }
  };

  const increaseTime = () => {
    if (time < 15) {
      onTimeChange(time + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Cooking Time *</Text>
      <Text style={styles.subtitle}>How long does it take to make this recipe?</Text>
      
      <View style={[styles.timeContainer, error && styles.errorBorder]}>
        <TouchableOpacity 
          style={[styles.timeButton, time <= 1 && styles.disabledButton]} 
          onPress={decreaseTime}
          disabled={time <= 1}
        >
          <Ionicons 
            name="remove" 
            size={20} 
            color={time <= 1 ? theme.colors.textSecondary : theme.colors.text} 
          />
        </TouchableOpacity>
        
        <View style={styles.timeDisplay}>
          <Text style={styles.timeNumber}>{time}</Text>
          <Text style={styles.timeUnit}>min{time !== 1 ? 's' : ''}</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.timeButton, time >= 15 && styles.disabledButton]} 
          onPress={increaseTime}
          disabled={time >= 15}
        >
          <Ionicons 
            name="add" 
            size={20} 
            color={time >= 15 ? theme.colors.textSecondary : theme.colors.text} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.quickOptions}>
        <Text style={styles.quickOptionsLabel}>Quick select:</Text>
        <View style={styles.quickButtonsContainer}>
          {[5, 10, 15].map((quickTime) => (
            <TouchableOpacity
              key={quickTime}
              style={[
                styles.quickButton,
                time === quickTime && styles.selectedQuickButton
              ]}
              onPress={() => onTimeChange(quickTime)}
            >
              <Text style={[
                styles.quickButtonText,
                time === quickTime && styles.selectedQuickButtonText
              ]}>
                {quickTime} min{quickTime !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  errorBorder: {
    borderColor: '#DC3545',
  },
  timeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  timeDisplay: {
    alignItems: 'center',
    marginHorizontal: 30,
  },
  timeNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  timeUnit: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  quickOptions: {
    alignItems: 'center',
  },
  quickOptionsLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  quickButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  quickButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedQuickButton: {
    backgroundColor: theme.colors.primary || '#007AFF',
    borderColor: theme.colors.primary || '#007AFF',
  },
  quickButtonText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '500',
  },
  selectedQuickButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorText: {
    color: '#DC3545',
    fontSize: 12,
    marginTop: 4,
  },
});