import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius } from '../theme';
import { StorageService, AuthService } from '../services';

interface AvatarPickerProps {
  avatarUrl?: string;
  size?: number;
  onUploadSuccess?: (url: string) => void;
  editable?: boolean;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  avatarUrl,
  size = 100,
  onUploadSuccess,
  editable = true,
}) => {
  const [uploading, setUploading] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | undefined>(avatarUrl);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Nous avons besoin de votre permission pour accéder à vos photos.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sélection de l\'image');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Nous avons besoin de votre permission pour accéder à la caméra.'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la prise de photo');
    }
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        Alert.alert('Erreur', 'Vous devez être connecté pour uploader un avatar');
        return;
      }

      const uploadedUrl = await StorageService.uploadAvatar(currentUser.id, uri);

      if (uploadedUrl) {
        setLocalAvatarUrl(uploadedUrl);
        onUploadSuccess?.(uploadedUrl);
        Alert.alert('Succès', 'Votre photo de profil a été mise à jour');
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue lors de l\'upload');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handlePress = () => {
    if (!editable || uploading) return;

    Alert.alert('Photo de profil', 'Choisissez une option', [
      {
        text: 'Prendre une photo',
        onPress: takePhoto,
      },
      {
        text: 'Choisir depuis la galerie',
        onPress: pickImage,
      },
      {
        text: 'Annuler',
        style: 'cancel',
      },
    ]);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: size, height: size }]}
      onPress={handlePress}
      disabled={!editable || uploading}
    >
      {localAvatarUrl ? (
        <Image
          source={{ uri: localAvatarUrl }}
          style={[styles.image, { width: size, height: size }]}
        />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size }]}>
          <Ionicons name="person" size={size * 0.5} color={colors.text.secondary} />
        </View>
      )}

      {uploading && (
        <View style={[styles.uploadingOverlay, { width: size, height: size }]}>
          <ActivityIndicator size="large" color={colors.accent.green} />
        </View>
      )}

      {editable && !uploading && (
        <View style={styles.editButton}>
          <Ionicons name="camera" size={16} color={colors.background.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    borderRadius: 1000,
    backgroundColor: colors.background.secondary,
  },
  placeholder: {
    borderRadius: 1000,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.dark,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.green,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background.primary,
  },
});

export default AvatarPicker;
