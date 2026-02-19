
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, spacing, typography } from '@/styles/commonStyles';

interface Client {
  id: string;
  name: string;
  age: number;
  gender: string;
  goals: string;
  experience: string;
  created_at: string;
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.dark;
  const themeColors = isDark ? colors.dark : colors.light;

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('HomeScreen mounted - loading clients');
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      console.log('Fetching clients from API');
      setLoading(true);
      // TODO: Backend Integration - GET /api/clients → [{ id, name, age, gender, goals, experience, created_at }]
      // Temporary: Show empty state
      setClients([]);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = () => {
    console.log('User tapped Add Client button');
    router.push('/new-client');
  };

  const handleClientPress = (clientId: string) => {
    console.log('User tapped client:', clientId);
    router.push(`/client/${clientId}`);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol
        ios_icon_name="person.2"
        android_material_icon_name="group"
        size={64}
        color={themeColors.textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
        No Clients Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
        Add your first client to start creating personalized workout programs
      </Text>
    </View>
  );

  const renderClient = (client: Client, index: number) => {
    const experienceBadgeColor =
      client.experience === 'beginner'
        ? themeColors.success
        : client.experience === 'intermediate'
        ? themeColors.highlight
        : themeColors.accent;

    return (
      <TouchableOpacity
        key={index}
        style={[styles.clientCard, { backgroundColor: themeColors.card }]}
        onPress={() => handleClientPress(client.id)}
        activeOpacity={0.7}
      >
        <View style={styles.clientHeader}>
          <View style={styles.clientInfo}>
            <Text style={[styles.clientName, { color: themeColors.text }]}>
              {client.name}
            </Text>
            <View style={styles.clientMeta}>
              <Text style={[styles.clientMetaText, { color: themeColors.textSecondary }]}>
                {client.age}
              </Text>
              <Text style={[styles.clientMetaText, { color: themeColors.textSecondary }]}>
                •
              </Text>
              <Text style={[styles.clientMetaText, { color: themeColors.textSecondary }]}>
                {client.gender}
              </Text>
            </View>
          </View>
          <View style={[styles.experienceBadge, { backgroundColor: experienceBadgeColor + '20' }]}>
            <Text style={[styles.experienceBadgeText, { color: experienceBadgeColor }]}>
              {client.experience}
            </Text>
          </View>
        </View>
        <View style={styles.clientGoals}>
          <IconSymbol
            ios_icon_name="target"
            android_material_icon_name="flag"
            size={16}
            color={themeColors.primary}
          />
          <Text style={[styles.clientGoalsText, { color: themeColors.textSecondary }]}>
            {client.goals}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'AI Workout Builder',
          headerLargeTitle: true,
          headerStyle: {
            backgroundColor: themeColors.background,
          },
          headerTintColor: themeColors.text,
          headerShadowVisible: false,
        }}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              Create personalized workout programs in under 60 seconds
            </Text>
          </View>

          {clients.length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={styles.clientList}>
              {clients.map((client, index) => renderClient(client, index))}
            </View>
          )}
        </ScrollView>
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: themeColors.primary }]}
        onPress={handleAddClient}
        activeOpacity={0.8}
      >
        <IconSymbol
          ios_icon_name="plus"
          android_material_icon_name="add"
          size={28}
          color="#FFFFFF"
        />
      </TouchableOpacity>
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
    padding: spacing.md,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: spacing.lg,
  },
  subtitle: {
    ...typography.bodySmall,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    ...typography.h3,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.bodySmall,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  clientList: {
    gap: spacing.md,
  },
  clientCard: {
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  clientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  clientMetaText: {
    ...typography.bodySmall,
  },
  experienceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  experienceBadgeText: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  clientGoals: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  clientGoalsText: {
    ...typography.bodySmall,
    textTransform: 'capitalize',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
