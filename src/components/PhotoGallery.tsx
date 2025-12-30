import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius } from '../theme';
import { StorageService, AuthService } from '../services';
import { DailyPhoto } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PhotoGalleryProps {
  photos: DailyPhoto[];
  onPhotosChange: (photos: DailyPhoto[]) => void;
  date: string;
  maxPhotos?: number;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos = [],
  onPhotosChange,
  date,
  maxPhotos = 6,
}) => {
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<DailyPhoto | null>(null);

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
    if (photos.length >= maxPhotos) {
      Alert.alert('Limite atteinte', `Vous ne pouvez ajouter que ${maxPhotos} photos maximum.`);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sélection de l\'image');
    }
  };

  const takePhoto = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Limite atteinte', `Vous ne pouvez ajouter que ${maxPhotos} photos maximum.`);
      return;
    }

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
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la prise de photo');
    }
  };

  const uploadPhoto = async (uri: string) => {
    setUploading(true);
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        Alert.alert('Information', 'Connectez-vous pour sauvegarder vos photos en ligne');
        const newPhoto: DailyPhoto = {
          id: `local-${Date.now()}`,
          uri,
          takenAt: new Date().toISOString(),
          type: 'progress',
        };
        onPhotosChange([...photos, newPhoto]);
        return;
      }

      const uploadedUrl = await StorageService.uploadProgressPhoto(currentUser.id, uri, date);

      if (uploadedUrl) {
        const newPhoto: DailyPhoto = {
          id: `photo-${Date.now()}`,
          uri: uploadedUrl,
          takenAt: new Date().toISOString(),
          type: 'progress',
        };
        onPhotosChange([...photos, newPhoto]);
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue lors de l\'upload');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = (photoId: string) => {
    Alert.alert(
      'Supprimer la photo',
      'Êtes-vous sûr de vouloir supprimer cette photo ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            onPhotosChange(photos.filter(p => p.id !== photoId));
          },
        },
      ]
    );
  };

  const handleAddPhoto = () => {
    Alert.alert('Ajouter une photo', 'Choisissez une option', [
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Photos de progression</Text>
        {photos.length > 0 && (
          <Text style={styles.count}>
            {photos.length}/{maxPhotos}
          </Text>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {photos.map((photo) => (
          <TouchableOpacity
            key={photo.id}
            style={styles.photoItem}
            onPress={() => setSelectedPhoto(photo)}
            onLongPress={() => deletePhoto(photo.id)}
          >
            <Image source={{ uri: photo.uri }} style={styles.photo} />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deletePhoto(photo.id)}
            >
              <Ionicons name="close-circle" size={24} color={colors.semantic.error} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {photos.length < maxPhotos && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPhoto}
            disabled={uploading}
          >
            <Ionicons
              name={uploading ? 'hourglass-outline' : 'add'}
              size={32}
              color={colors.text.tertiary}
            />
            <Text style={styles.addButtonText}>
              {uploading ? 'Upload...' : 'Ajouter'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal
        visible={selectedPhoto !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedPhoto(null)}
        >
          <View style={styles.modalContent}>
            {selectedPhoto && (
              <>
                <Image
                  source={{ uri: selectedPhoto.uri }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
                <Text style={styles.photoDate}>
                  {new Date(selectedPhoto.takenAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedPhoto(null)}
            >
              <Ionicons name="close" size={32} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  count: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  scrollView: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  photoItem: {
    position: 'relative',
    marginRight: spacing.md,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
  },
  addButton: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.dark,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    height: SCREEN_HEIGHT - 200,
  },
  photoDate: {
    fontSize: 14,
    color: colors.text.primary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: spacing.lg,
    padding: spacing.sm,
  },
});

export default PhotoGallery;
