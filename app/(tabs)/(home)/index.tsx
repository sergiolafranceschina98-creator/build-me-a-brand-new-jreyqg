
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { colors, spacing, typography } from '@/styles/commonStyles';
import React, { useState, useCallback } from 'react';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import Constants from 'expo-constants';
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

export default function HomeScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { colors: themeColors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;

  const loadClients = useCallback(async (isRefresh: boolean = false) => {
    if (isRefresh) {
      setRefreshing(true);
      console.log('🔄 Refreshing clients list...');
    } else {
      setLoading(true);
    }
    setError(null);

    const backendUrl = Constants.expoConfig?.extra?.backendUrl;
    console.log('[API] GET /api/clients - Loading clients...');
    console.log('[API] Backend URL:', backendUrl);

    if (!backendUrl) {
      const errorMsg = 'Backend URL not configured in app.json';
      console.error('❌ [API] Error:', errorMsg);
      setError(errorMsg);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const url = `${backendUrl}/api/clients`;
      console.log('[API] Fetching from:', url);

      const response = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('[API] Response status:', response.status);
      console.log('[API] Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`Failed to fetch clients: ${response.status}`);
      }

      const data: Client[] = await response.json();
      console.log('[API] ✅ Clients loaded successfully:', data.length);
      setClients(data);
      setError(null);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        const errorMsg = 'Request timeout - please check your connection';
        console.error('⏱️ [API] Timeout:', errorMsg);
        setError(errorMsg);
      } else {
        const errorMsg = err.message || 'Failed to load clients';
        console.error('❌ [API] Error:', errorMsg);
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('[API] ✅ Loading complete - UI should now be visible');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('🏠 HOME SCREEN - Screen Focused');
      loadClients(false);
    }, [loadClients])
  );

  const handleAddClient = () => {
    console.log('➕ User tapped Add Client button');
    router.push('/new-client');
  };

  const handleClientPress = (clientId: string) => {
    console.log('👤 User tapped client:', clientId);
    router.push(`/client/${clientId}`);
  };

  const handleRetry = () => {
    console.log('🔄 User tapped Retry button');
    loadClients(false);
  };

  const renderEmptyState = () => {
    const emptyStateText = 'No clients yet';
    const emptyStateSubtext = 'Tap the + button to add your first client';
    
    return (
      <View style={styles.emptyState}>
        <IconSymbol
          ios_icon_name="person.crop.circle.badge.plus"
          android_material_icon_name="person-add"
          size={80}
          color={colors.textSecondary}
        />
        <Text style={[styles.emptyStateText, { color: themeColors.text }]}>
          {emptyStateText}
        </Text>
        <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
          {emptyStateSubtext}
        </Text>
        <View style={styles.statusIndicator}>
          <View style={styles.statusDot} />
          <Text style={[styles.statusText, { color: colors.success }]}>
            System Ready
          </Text>
        </View>
      </View>
    );
  };

  const renderClient = (client: Client, index: number) => {
    const experienceText = client.experience;
    const goalText = client.goals;
    const ageText = `${client.age} years old`;
    
    return (
      <TouchableOpacity
        key={client.id}
        style={[
          styles.clientCard,
          {
            backgroundColor: themeColors.card,
            width: isTablet ? '48%' : '100%',
            marginRight: isTablet && index % 2 === 0 ? '4%' : 0,
          },
        ]}
        onPress={() => handleClientPress(client.id)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.1)', 'rgba(59, 130, 246, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.clientHeader}>
            <View style={styles.avatarContainer}>
              <IconSymbol
                ios_icon_name="person.circle.fill"
                android_material_icon_name="account-circle"
                size={48}
                color={colors.primary}
              />
            </View>
            <View style={styles.clientInfo}>
              <Text style={[styles.clientName, { color: themeColors.text }]}>
                {client.name}
              </Text>
              <Text style={[styles.clientDetail, { color: colors.textSecondary }]}>
                {ageText}
              </Text>
            </View>
          </View>

          <View style={styles.clientStats}>
            <View style={styles.statItem}>
              <IconSymbol
                ios_icon_name="target"
                android_material_icon_name="flag"
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {goalText}
              </Text>
            </View>
            <View style={styles.statItem}>
              <IconSymbol
                ios_icon_name="chart.bar.fill"
                android_material_icon_name="bar-chart"
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {experienceText}
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.primary}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen
          options={{
            title: 'Clients',
            headerRight: () => null,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading clients...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    const errorTitle = 'Unable to load clients';
    const retryButtonText = 'Retry';
    
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen
          options={{
            title: 'Clients',
            headerRight: () => (
              <TouchableOpacity onPress={handleAddClient} style={styles.addButton}>
                <IconSymbol
                  ios_icon_name="plus"
                  android_material_icon_name="add"
                  size={28}
                  color={colors.primary}
                />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.errorContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle.fill"
            android_material_icon_name="error"
            size={64}
            color={colors.error}
          />
          <Text style={[styles.errorTitle, { color: themeColors.text }]}>
            {errorTitle}
          </Text>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>{retryButtonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen
        options={{
          title: 'Clients',
          headerRight: () => (
            <TouchableOpacity onPress={handleAddClient} style={styles.addButton}>
              <IconSymbol
                ios_icon_name="plus"
                android_material_icon_name="add"
                size={28}
                color={colors.primary}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isTablet && styles.scrollContentTablet,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadClients(true)}
            tintColor={colors.primary}
          />
        }
      >
        {clients.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={[styles.clientsGrid, isTablet && styles.clientsGridTablet]}>
            {clients.map((client, index) => renderClient(client, index))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: Platform.OS === 'android' ? 48 : spacing.lg,
  },
  scrollContentTablet: {
    paddingHorizontal: spacing.xl * 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  errorText: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginTop: spacing.md,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 3,
    gap: spacing.md,
  },
  emptyStateText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginTop: spacing.lg,
  },
  emptyStateSubtext: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  clientsGrid: {
    gap: spacing.md,
  },
  clientsGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  clientCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  cardGradient: {
    padding: spacing.lg,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  clientDetail: {
    fontSize: typography.sizes.sm,
  },
  clientStats: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statText: {
    fontSize: typography.sizes.sm,
    textTransform: 'capitalize',
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  addButton: {
    padding: spacing.sm,
  },
});
