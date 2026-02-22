import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Chargement...',
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.accent.green} />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.background.elevated,
    padding: spacing.xxl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    minWidth: 160,
  },
  message: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});

export default LoadingOverlay;
