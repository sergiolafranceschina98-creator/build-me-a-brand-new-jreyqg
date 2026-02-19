
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography } from '@/styles/commonStyles';
import React, { useState, useEffect } from 'react';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import Constants from 'expo-constants';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';

interface Client {
  id: string;
  name: string;
  age: number;
  gender: string;
  goals: string;
  experience: string;
  createdAt: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  addButtonText: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    marginLeft: spacing.sm,
  },
  clientCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  clientName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    flex: 1,
  },
  clientInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  infoChip: {
    backgroundColor: colors.cardBackgroundAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    fontSize: typography.sizes.md,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
  },
  retryButtonText: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
  },
  clientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  clientCardTablet: {
    flex: 1,
    minWidth: 300,
    maxWidth: '48%',
  },
});

export default function HomeScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const loadClients = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    console.log('[API] GET /api/clients - Loading clients...');

    try {
      const backendUrl = Constants.expoConfig?.extra?.backendUrl;
      console.log('[API] Backend URL:', backendUrl);

      if (!backendUrl) {
        throw new Error('Backend URL not configured');
      }

      const url = `${backendUrl}/api/clients`;
      console.log('[API] Fetching from:', url);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('[API] Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to load clients: ${response.status}`);
      }

      const data = await response.json();
      console.log('[API] Clients loaded successfully:', data.length);

      setClients(data);
      setError(null);
    } catch (err: any) {
      console.error('[API] Error loading clients:', err);
      
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.');
      } else {
        setError(err.message || 'Failed to load clients. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      console.log('🏠 HOME SCREEN - Screen Focused');
      loadClients();
    }, [])
  );

  const handleAddClient = () => {
    console.log('👤 USER ACTION: Add Client Button Pressed');
    router.push('/new-client');
  };

  const handleClientPress = (clientId: string) => {
    console.log('👤 USER ACTION: Client Card Pressed');
    console.log('👤 Client ID:', clientId);
    router.push(`/client/${clientId}`);
  };

  const handleRetry = () => {
    console.log('🔄 USER ACTION: Retry Button Pressed');
    loadClients();
  };

  const renderEmptyState = () => {
    const emptyIconSize = 80;
    const emptyTitleText = 'No Clients Yet';
    const emptySubtitleText = 'Create your first client profile to start building personalized workout programs';

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <IconSymbol
            ios_icon_name="person.2"
            android_material_icon_name="group"
            size={emptyIconSize}
            color={colors.textSecondary}
          />
        </View>
        <Text style={styles.emptyTitle}>{emptyTitleText}</Text>
        <Text style={styles.emptySubtitle}>{emptySubtitleText}</Text>
      </View>
    );
  };

  const renderClient = (client: Client, index: number) => {
    const ageText = `${client.age} years`;
    const genderText = client.gender;
    const experienceText = client.experience;

    return (
      <TouchableOpacity
        key={client.id}
        style={[styles.clientCard, isTablet && styles.clientCardTablet]}
        onPress={() => handleClientPress(client.id)}
        activeOpacity={0.7}
      >
        <View style={styles.clientHeader}>
          <Text style={styles.clientName}>{client.name}</Text>
          <IconSymbol
            ios_icon_name="chevron.right"
            android_material_icon_name="arrow-forward"
            size={20}
            color={colors.textSecondary}
          />
        </View>
        <View style={styles.clientInfo}>
          <View style={styles.infoChip}>
            <Text style={styles.infoText}>{ageText}</Text>
          </View>
          <View style={styles.infoChip}>
            <Text style={styles.infoText}>{genderText}</Text>
          </View>
          <View style={styles.infoChip}>
            <Text style={styles.infoText}>{experienceText}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const headerTitleText = 'AI Workout Builder';
  const headerSubtitleText = 'Manage your clients and programs';
  const addButtonText = 'Add New Client';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[colors.background, colors.cardBackground]}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{headerTitleText}</Text>
          <Text style={styles.headerSubtitle}>{headerSubtitleText}</Text>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadClients(true)}
                tintColor={colors.primary}
              />
            }
          >
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddClient}
              activeOpacity={0.8}
            >
              <IconSymbol
                ios_icon_name="plus"
                android_material_icon_name="add"
                size={24}
                color={colors.text}
              />
              <Text style={styles.addButtonText}>{addButtonText}</Text>
            </TouchableOpacity>

            {clients.length === 0 ? (
              renderEmptyState()
            ) : isTablet ? (
              <View style={styles.clientsGrid}>
                {clients.map((client, index) => renderClient(client, index))}
              </View>
            ) : (
              clients.map((client, index) => renderClient(client, index))
            )}
          </ScrollView>
        )}
      </LinearGradient>
    </>
  );
}
