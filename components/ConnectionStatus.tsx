
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetworkState } from 'expo-network';

export function ConnectionStatus() {
  const networkState = useNetworkState();
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Only show status if offline
    if (!networkState.isConnected || networkState.isInternetReachable === false) {
      setShowStatus(true);
    } else {
      // Hide after 2 seconds if online
      const timer = setTimeout(() => setShowStatus(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  if (!showStatus) return null;

  const isOffline = !networkState.isConnected || networkState.isInternetReachable === false;

  return (
    <View style={[styles.container, isOffline ? styles.offline : styles.online]}>
      <Text style={styles.text}>
        {isOffline ? '🔌 Offline Mode' : '✅ Connected'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 8,
    zIndex: 9999,
    alignItems: 'center',
  },
  offline: {
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
  },
  online: {
    backgroundColor: 'rgba(52, 199, 89, 0.9)',
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
