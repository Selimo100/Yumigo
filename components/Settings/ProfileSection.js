// Profile Section - Sektion zur Bearbeitung von Profildaten (Avatar, Bio, etc.)
import {useState} from 'react';
import {ActivityIndicator, Alert, Image, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {uploadProfileImage} from '../../services/userService';
import {auth} from '../../lib/firebaseconfig';

export const ProfileSection = ({ profile, updateProfile, styles, theme }) => {
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const pickProfileImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploadingImage(true);
        try {
          const currentUser = auth.currentUser;
          if (!currentUser) {
            Alert.alert('Error', 'No authenticated user found');
            return;
          }

          // Upload image to Firebase Storage
          const imageUrl = await uploadProfileImage(result.assets[0].uri, currentUser.uid);
          
          // Update profile with new image URL
          updateProfile({ avatar: imageUrl });
          
        } catch (error) {
          Alert.alert('Error', 'Failed to upload image. Please try again.');
        } finally {
          setIsUploadingImage(false);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      setIsUploadingImage(false);
    }
  };

  return (
    <View style={styles.profileSection}>      <TouchableOpacity 
        style={styles.profileImageContainer} 
        onPress={pickProfileImage}
        disabled={isUploadingImage}
      >
        {profile.avatar ? (
          <Image source={{ uri: profile.avatar }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Ionicons name="person" size={40} color={theme.colors.textSecondary} />
          </View>
        )}
        <View style={styles.cameraIcon}>
          {isUploadingImage ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="camera" size={16} color="#fff" />
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.profileInputs}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
            style={styles.input}
            value={profile.username}
            onChangeText={(text) => updateProfile({ username: text })}
            placeholder="Enter username"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={profile.email}
            onChangeText={(text) => updateProfile({ email: text })}
            placeholder="Enter email"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={profile.bio}
            onChangeText={(text) => updateProfile({ bio: text })}
            placeholder="Tell us about yourself"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>
    </View>
  );
};
