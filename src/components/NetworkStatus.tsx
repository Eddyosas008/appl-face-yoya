import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

interface NetworkStatusProps {
  isConnected: boolean;
}

export const NetworkStatusBar: React.FC<NetworkStatusProps> = ({ isConnected }) => {
  const [showBar, setShowBar] = useState(false);
  const [wasDisconnected, setWasDisconnected] = useState(false);
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isConnected) {
      setShowBar(true);
      setWasDisconnected(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (wasDisconnected) {
      // Show "back online" briefly
      setShowBar(true);
      hideTimeout.current = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowBar(false);
          setWasDisconnected(false);
        });
      }, 2000);
    }

    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, [isConnected]);

  if (!showBar) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
        isConnected ? styles.connectedBar : styles.disconnectedBar,
      ]}
    >
      <Ionicons
        name={isConnected ? 'wifi' : 'cloud-offline'}
        size={16}
        color={isConnected ? colors.background.primary : colors.text.primary}
      />
      <Text
        style={[
          styles.text,
          isConnected ? styles.connectedText : styles.disconnectedText,
        ]}
      >
        {isConnected ? 'Connexion rétablie' : 'Hors ligne - Les données sont sauvegardées localement'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  disconnectedBar: {
    backgroundColor: colors.accent.coral,
  },
  connectedBar: {
    backgroundColor: colors.state.success,
  },
  text: {
    ...typography.caption,
    marginLeft: spacing.sm,
  },
  disconnectedText: {
    color: colors.text.primary,
  },
  connectedText: {
    color: colors.background.primary,
  },
});

export default NetworkStatusBar;
