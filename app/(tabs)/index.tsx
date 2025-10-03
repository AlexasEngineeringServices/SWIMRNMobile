import { Platform, StyleSheet, View } from "react-native";
import { Divider, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { swimTheme } from "../../hooks/useCustomTheme";
import { useAuthStore } from "../../store/authStore";

export default function HomeScreen() {
  const { user, loading } = useAuthStore();

  if (loading) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Text variant="bodyMedium" style={styles.greetingText}>
            Welcome back,
          </Text>
          <Text variant="headlineLarge" style={styles.nameText}>
            {user?.firstname || "User"}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.dashboardCard}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Device Information
          </Text>
          <Divider style={styles.cardDivider} />

          <View style={styles.deviceInfo}>
            <View style={styles.deviceRow}>
              <Text variant="bodySmall" style={styles.deviceLabel}>
                Device Name
              </Text>
              <Text variant="bodyMedium" style={styles.deviceValue}>
                {user?.device_name || "No device"}
              </Text>
            </View>
            <View style={styles.deviceRow}>
              <Text variant="bodySmall" style={styles.deviceLabel}>
                Device Number
              </Text>
              <Text variant="bodyMedium" style={styles.deviceValue}>
                {user?.device_number || "Not registered"}
              </Text>
            </View>
          </View>

          <Divider style={[styles.cardDivider, styles.sectionDivider]} />

          <Text variant="titleMedium" style={[styles.sectionTitle, styles.statsTitle]}>
            Water Consumption
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text variant="headlineMedium" style={styles.statNumber}>
                0L
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Daily Target
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text variant="headlineMedium" style={styles.statNumber}>
                0L
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Consumed
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text variant="headlineMedium" style={styles.statNumber}>
                0%
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Daily Goal
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>{/* Footer content if needed */}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  deviceInfo: {
    marginVertical: 8,
  },
  deviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  deviceLabel: {
    color: swimTheme.colors.border,
    ...swimTheme.fonts.regular,
  },
  deviceValue: {
    color: swimTheme.colors.text,
    ...swimTheme.fonts.medium,
  },
  sectionDivider: {
    marginTop: 24,
  },
  statsTitle: {
    marginTop: 8,
  },
  container: {
    flex: 1,
    backgroundColor: swimTheme.colors.background,
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: swimTheme.colors.background,
  },
  welcomeSection: {
    marginBottom: 8,
  },
  greetingText: {
    color: swimTheme.colors.border,
    ...swimTheme.fonts.regular,
    fontSize: 16,
  },
  nameText: {
    color: swimTheme.colors.text,
    ...swimTheme.fonts.bold,
    fontSize: 32,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dashboardCard: {
    backgroundColor: swimTheme.colors.card,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    color: swimTheme.colors.text,
    ...swimTheme.fonts.medium,
  },
  cardDivider: {
    backgroundColor: swimTheme.colors.border,
    height: 1,
    marginVertical: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
  },
  statNumber: {
    color: swimTheme.colors.primary,
    ...swimTheme.fonts.bold,
    fontSize: 24,
  },
  statLabel: {
    color: swimTheme.colors.border,
    ...swimTheme.fonts.regular,
    marginTop: 4,
  },
  footer: {
    padding: 20,
  },
});
