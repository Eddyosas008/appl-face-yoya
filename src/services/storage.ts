import { supabase } from './supabase';
import * as ImageManipulator from 'expo-image-manipulator';

export type MediaType = 'avatar' | 'progress' | 'journal';

export class StorageService {
  private static BUCKET_NAME = 'user-media';

  static async ensureBucketExists() {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === this.BUCKET_NAME);

      if (!bucketExists) {
        await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: false,
          fileSizeLimit: 5242880,
        });
      }
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
    }
  }

  static async compressImage(uri: string, maxWidth = 800): Promise<string> {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxWidth } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipResult.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return uri;
    }
  }

  static async uploadImage(
    userId: string,
    imageUri: string,
    type: MediaType,
    fileName?: string
  ): Promise<string | null> {
    try {
      await this.ensureBucketExists();

      const compressedUri = await this.compressImage(imageUri);

      const response = await fetch(compressedUri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      const timestamp = Date.now();
      const extension = 'jpg';
      const finalFileName = fileName || `${type}_${timestamp}.${extension}`;
      const filePath = `${userId}/${type}/${finalFileName}`;

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  }

  static async uploadAvatar(userId: string, imageUri: string): Promise<string | null> {
    try {
      const oldAvatarPath = `${userId}/avatar/`;
      const { data: existingFiles } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(oldAvatarPath);

      if (existingFiles && existingFiles.length > 0) {
        const filesToRemove = existingFiles.map(
          file => `${oldAvatarPath}${file.name}`
        );
        await supabase.storage.from(this.BUCKET_NAME).remove(filesToRemove);
      }

      return await this.uploadImage(userId, imageUri, 'avatar', 'profile.jpg');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  }

  static async uploadProgressPhoto(
    userId: string,
    imageUri: string,
    date: string
  ): Promise<string | null> {
    try {
      const fileName = `progress_${date}.jpg`;
      return await this.uploadImage(userId, imageUri, 'progress', fileName);
    } catch (error) {
      console.error('Error uploading progress photo:', error);
      return null;
    }
  }

  static async uploadJournalPhoto(
    userId: string,
    imageUri: string
  ): Promise<string | null> {
    try {
      return await this.uploadImage(userId, imageUri, 'journal');
    } catch (error) {
      console.error('Error uploading journal photo:', error);
      return null;
    }
  }

  static async deleteImage(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  static async listUserImages(userId: string, type: MediaType): Promise<string[]> {
    try {
      const folderPath = `${userId}/${type}`;
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(folderPath);

      if (error) throw error;

      if (!data) return [];

      return data.map(file => {
        const { data: urlData } = supabase.storage
          .from(this.BUCKET_NAME)
          .getPublicUrl(`${folderPath}/${file.name}`);
        return urlData.publicUrl;
      });
    } catch (error) {
      console.error('Error listing user images:', error);
      return [];
    }
  }

  static getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);
    return data.publicUrl;
  }
}

export default StorageService;
