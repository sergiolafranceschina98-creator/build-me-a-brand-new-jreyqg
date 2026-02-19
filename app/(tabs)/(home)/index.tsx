
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography } from '@/styles/commonStyles';
import React, { useState, useEffect } from 'react';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import Constants from 'expo-constants';
import { IconSymbol } from '@/components/IconSymbol';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';

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
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  addButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  addButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
  },
  clientsGrid: {
    gap: spacing.md,
  },
  clientCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  clientCardGradient: {
    padding: spacing.lg,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  clientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  clientMetaText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  clientDetails: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyIcon: {
    marginBottom: spacing.xl,
    opacity: 0.5,
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
    paddingHorizontal: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  twoColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  columnCard: {
    flex: 1,
    minWidth: 300,
  },
});

export default function HomeScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors: themeColors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;

  useFocusEffect(
    React.useCallback(() => {
      console.log('🏠 ============================================');
      console.log('🏠 HOME SCREEN - Screen Focused');
      console.log('🏠 ============================================');
      loadClients();
    }, [])
  );

  const loadClients = async () => {
    console.log('[API] ============================================');
    console.log('[API] GET /api/clients - Loading clients...');
    console.log('[API] ============================================');
    
    const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl;
    console.log('[API] Backend URL:', BACKEND_URL);
    
    if (!BACKEND_URL) {
      console.error('❌ [API] ERROR: Backend URL not configured!');
      setLoading(false);
      return;
    }

    try {
      const url = `${BACKEND_URL}/api/clients`;
      console.log('[API] Fetching from:', url);
      
      const response = await fetch(url);
      console.log('[API] Response status:', response.status);
      console.log('[API] Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [API] Error response:', errorText);
        throw new Error(`Failed to load clients: ${response.status}`);
      }

      const data = await response.json();
      console.log('[API] ============================================');
      console.log('[API] Clients loaded successfully:', data.length);
      console.log('[API] ============================================');
      
      if (data.length > 0) {
        console.log('[API] First client:', JSON.stringify(data[0], null, 2));
      }
      
      setClients(data);
    } catch (error) {
      console.error('❌ ============================================');
      console.error('❌ ERROR LOADING CLIENTS');
      console.error('❌ ============================================');
      console.error('❌ Error:', error);
      console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    } finally {
      setLoading(false);
      console.log('[API] Loading complete, setting loading to false');
    }
  };

  const handleAddClient = () => {
    console.log('👤 ============================================');
    console.log('👤 USER ACTION: Add Client Button Pressed');
    console.log('👤 ============================================');
    console.log('👤 Navigating to: /new-client');
    router.push('/new-client');
  };

  const handleClientPress = (clientId: string) => {
    console.log('👤 ============================================');
    console.log('👤 USER ACTION: Client Card Pressed');
    console.log('👤 ============================================');
    console.log('👤 Client ID:', clientId);
    console.log('👤 Navigating to: /client/' + clientId);
    router.push(`/client/${clientId}`);
  };

  const renderEmptyState = () => {
    console.log('📋 Rendering empty state (no clients)');
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <IconSymbol
            ios_icon_name="person.3.fill"
            android_material_icon_name="group"
            size={80}
            color={colors.textSecondary}
          />
        </View>
        <Text style={styles.emptyTitle}>No Clients Yet</Text>
        <Text style={styles.emptySubtitle}>
          Create your first client profile to start building personalized workout programs
        </Text>
      </View>
    );
  };

  const renderClient = (client: Client, index: number) => {
    const formattedDate = new Date(client.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <TouchableOpacity
        key={client.id}
        style={[styles.clientCard, isTablet && styles.columnCard]}
        onPress={() => handleClientPress(client.id)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.cardBackground, colors.cardBackgroundAlt]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.clientCardGradient}
        >
          <View style={styles.clientHeader}>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{client.name}</Text>
              <View style={styles.clientMeta}>
                <Text style={styles.clientMetaText}>{client.age} years</Text>
                <Text style={styles.clientMetaText}>•</Text>
                <Text style={styles.clientMetaText}>{client.gender}</Text>
              </View>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={24}
              color={colors.primary}
            />
          </View>

          <View style={styles.clientDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Experience</Text>
              <Text style={styles.detailValue}>{client.experience}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Goals</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {client.goals}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>{formattedDate}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    console.log('⏳ Rendering loading state...');
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Clients',
            headerShown: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  console.log('📋 ============================================');
  console.log('📋 RENDERING HOME SCREEN');
  console.log('📋 ============================================');
  console.log('📋 Total clients:', clients.length);
  console.log('📋 Is tablet:', isTablet);
  console.log('📋 Screen width:', width);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Clients',
          headerShown: false,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Your Clients</Text>
          <Text style={styles.subtitle}>
            {clients.length === 0
              ? 'Get started by adding your first client'
              : `${clients.length} ${clients.length === 1 ? 'client' : 'clients'}`}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddClient}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addButtonGradient}
          >
            <IconSymbol
              ios_icon_name="plus.circle.fill"
              android_material_icon_name="add"
              size={24}
              color={colors.text}
            />
            <Text style={styles.addButtonText}>Add New Client</Text>
          </LinearGradient>
        </TouchableOpacity>

        {clients.length === 0 ? (
          renderEmptyState()
        ) : isTablet ? (
          <View style={styles.twoColumnGrid}>
            {clients.map((client, index) => renderClient(client, index))}
          </View>
        ) : (
          <View style={styles.clientsGrid}>
            {clients.map((client, index) => renderClient(client, index))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
