import { useRouter } from "expo-router";
import moment from "moment";
import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Button, Divider, Text } from "react-native-paper";
import { swimTheme } from "../../hooks/useCustomTheme";
import { mockWaterUsageData, WaterUsageData } from "../../services/mockWaterUsageData";
import { useAuthStore } from "../../store/authStore";
import { useWaterUsageStore } from "../../store/waterUsageStore";

export default function HomeScreen() {
  const { user, loading: authLoading } = useAuthStore();
  const deviceId = user?.device_number || "device-001";

  const { setUsageHistory, getDeviceReadings } = useWaterUsageStore();

  useEffect(() => {
    setUsageHistory(mockWaterUsageData);
  }, [setUsageHistory]);

  // Filter readings for the current device
  const deviceReadings = getDeviceReadings(deviceId);

  // Mock the date where there is data for today and yesterday
  const today = moment.utc("2025-10-10"); // Fixed date for October 10, 2025 in UTC
  const yesterday = moment.utc("2025-10-09"); // Fixed date for October 9, 2025 in UTC

  // Sum all roundCount readings for today
  const todaySum = deviceReadings
    .filter((entry: WaterUsageData) => moment.utc(entry.enqueuedAt).isSame(today, "day"))
    .reduce((sum, entry) => sum + entry.roundCount, 0);

  // Sum all roundCount readings for yesterday
  const yesterdaySum = deviceReadings
    .filter((entry: WaterUsageData) => moment.utc(entry.enqueuedAt).isSame(yesterday, "day"))
    .reduce((sum, entry) => sum + entry.roundCount, 0);

  // Calculate incremental value
  const dailyIncrement = todaySum - yesterdaySum;

  // Use dailyIncrement in your chart
  const dailyReadings = [
    { label: "Yesterday", value: yesterdaySum },
    { label: "Today", value: todaySum },
    { label: "Increment", value: dailyIncrement },
  ];

  const router = useRouter();

  const loading = authLoading;

  if (loading) return null;

  return (
    <View style={styles.container}>
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

          <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 24 }]}>
            Daily Water Consumption
          </Text>
          <View style={styles.chartContainer}>
            {dailyReadings.map((item, idx) => (
              <View key={item.label} style={styles.barRow}>
                <Text style={styles.barLabel}>{item.label}</Text>
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${(item.value / 10) * 100}%`,
                        backgroundColor: swimTheme.colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barValue}>{item.value}L</Text>
              </View>
            ))}
          </View>
          <Button
            mode="contained"
            style={styles.viewMoreBtn}
            contentStyle={styles.viewMoreContent}
            labelStyle={styles.viewMoreLabel}
            onPress={() => router.push("/(tabs)/usage-history")}
          >
            View More
          </Button>
        </View>
      </View>

      <View style={styles.footer}>{/* Footer content if needed */}</View>
    </View>
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
    marginVertical: 8,
    backgroundColor: swimTheme.colors.background,
  },
  header: {
    paddingVertical: 8,
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
    padding: 12,
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
    marginBottom: 4,
    marginTop: 0,
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
  chartContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  barLabel: {
    width: 80,
    color: swimTheme.colors.text,
    ...swimTheme.fonts.medium,
  },
  barBackground: {
    flex: 1,
    height: 18,
    backgroundColor: swimTheme.colors.border,
    borderRadius: 9,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  barFill: {
    height: 18,
    borderRadius: 9,
  },
  barValue: {
    width: 40,
    textAlign: "right",
    color: swimTheme.colors.primary,
    ...swimTheme.fonts.bold,
  },
  viewMoreBtn: {
    marginTop: 8,
    alignSelf: "flex-end",
    backgroundColor: swimTheme.colors.primary,
  },
  viewMoreContent: {
    height: 40,
  },
  viewMoreLabel: {
    color: "#FFF",
    ...swimTheme.fonts.medium,
    fontSize: 16,
  },
});
