
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useTheme } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

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
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.dark;
  const themeColors = isDark ? colors.dark : colors.light;

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    console.log('Loading clients...');
    setLoading(true);
    // TODO: Backend Integration - GET /api/clients to fetch client list
    // Simulated data for now
    setTimeout(() => {
      setClients([]);
      setLoading(false);
    }, 500);
  };

  const handleAddClient = () => {
    console.log('User tapped Add Client button');
    router.push('/new-client');
  };

  const handleClientPress = (clientId: string) => {
    console.log('User tapped client:', clientId);
    router.push(`/client/${clientId}`);
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <LinearGradient
          colors={[themeColors.primary + '20', themeColors.secondary + '10']}
          style={styles.emptyGradient}
        >
          <View style={styles.emptyIconContainer}>
            <IconSymbol
              ios_icon_name="person.2.fill"
              android_material_icon_name="group"
              size={64}
              color={themeColors.primary}
            />
          </View>
          <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
            No Clients Yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
            Start building personalized workout programs by adding your first client
          </Text>
        </LinearGradient>
      </View>
    );
  };

  const renderClient = (client: Client, index: number) => {
    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleClientPress(client.id)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={[themeColors.card, themeColors.card]}
          style={[styles.clientCard, { borderColor: themeColors.border }]}
        >
          <View style={styles.clientHeader}>
            <View style={styles.clientAvatar}>
              <LinearGradient
                colors={[themeColors.primary, themeColors.secondary]}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>
                  {client.name.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            </View>
            <View style={styles.clientInfo}>
              <Text style={[styles.clientName, { color: themeColors.text }]}>
                {client.name}
              </Text>
              <View style={styles.clientMeta}>
                <Text style={[styles.clientMetaText, { color: themeColors.textSecondary }]}>
                  {client.age} years
                </Text>
                <View style={[styles.dot, { backgroundColor: themeColors.textSecondary }]} />
                <Text style={[styles.clientMetaText, { color: themeColors.textSecondary }]}>
                  {client.experience}
                </Text>
              </View>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={themeColors.textSecondary}
            />
          </View>
          <View style={[styles.clientGoals, { backgroundColor: themeColors.primary + '15' }]}>
            <Text style={[styles.clientGoalsText, { color: themeColors.primary }]}>
              {client.goals}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Clients',
          headerLargeTitle: true,
          headerStyle: {
            backgroundColor: themeColors.background,
          },
          headerTintColor: themeColors.text,
          headerRight: () => (
            <TouchableOpacity onPress={handleAddClient} style={styles.addButton}>
              <LinearGradient
                colors={[themeColors.primary, themeColors.secondary]}
                style={styles.addButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <IconSymbol
                  ios_icon_name="plus"
                  android_material_icon_name="add"
                  size={20}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </TouchableOpacity>
          ),
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
          {clients.length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={styles.clientsList}>
              {clients.map((client, index) => renderClient(client, index))}
            </View>
          )}
        </ScrollView>
      )}

      {clients.length > 0 && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleAddClient}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[themeColors.primary, themeColors.secondary]}
            style={styles.floatingButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <IconSymbol
              ios_icon_name="plus"
              android_material_icon_name="add"
              size={28}
              color="#FFFFFF"
            />
          </LinearGradient>
        </TouchableOpacity>
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: 60,
  },
  emptyGradient: {
    width: '100%',
    padding: spacing.xl,
    borderRadius: 24,
    alignItems: 'center',
  },
  emptyIconContainer: {
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    textAlign: 'center',
    opacity: 0.8,
  },
  clientsList: {
    gap: spacing.md,
  },
  clientCard: {
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  clientAvatar: {
    marginRight: spacing.md,
  },
  avatarGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    ...typography.h3,
    marginBottom: 4,
  },
  clientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  clientMetaText: {
    ...typography.bodySmall,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  clientGoals: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
  },
  clientGoalsText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  addButton: {
    marginRight: spacing.sm,
  },
  addButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  floatingButtonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
