import { useRouter } from "expo-router";
import moment from "moment";
import { useEffect } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Divider, Text } from "react-native-paper";
import Svg, { Circle } from "react-native-svg";
import { swimTheme } from "../../hooks/useCustomTheme";
import { mockWaterUsageData, WaterUsageData } from "../../services/mockWaterUsageData";
import { useAuthStore } from "../../store/authStore";
import { useWaterUsageStore } from "../../store/waterUsageStore";

export default function HomeScreen() {
  const { user, loading: authLoading } = useAuthStore();
  const deviceId = user?.device_number || "";

  const { setUsageHistory, getDeviceReadings } = useWaterUsageStore();

  useEffect(() => {
    setUsageHistory(mockWaterUsageData);
  }, [setUsageHistory]);

  // Filter readings for the current device
  const deviceReadings = getDeviceReadings(deviceId);

  // Get current readings (today) and last readings (most recent past date)
  const today = moment.utc();

  // Get all unique dates from readings, sorted in descending order
  const uniqueDates = [
    ...new Set(deviceReadings.map((entry) => moment.utc(entry.enqueuedAt).format("YYYY-MM-DD"))),
  ]
    .sort()
    .reverse();

  // Get today's readings
  const currentReadings = deviceReadings.filter((entry: WaterUsageData) =>
    moment.utc(entry.enqueuedAt).isSame(today, "day")
  );

  // Sum of current readings
  const currentSum = currentReadings.reduce((sum, entry) => sum + entry.roundCount, 0);

  // Get the last reading date (excluding today)
  const lastReadingDate = uniqueDates.find((date) => !moment.utc(date).isSame(today, "day"));

  // Get last readings from the last date and find the latest one based on enqueuedAt
  const lastReadings = deviceReadings
    .filter(
      (entry: WaterUsageData) =>
        moment.utc(entry.enqueuedAt).format("YYYY-MM-DD") === lastReadingDate
    )
    .sort((a, b) => moment.utc(b.enqueuedAt).valueOf() - moment.utc(a.enqueuedAt).valueOf());

  // Get only the latest reading
  const latestReading = lastReadings[0];

  // Sum of last reading (only the latest one)
  const lastSum = latestReading ? latestReading.roundCount : 0;

  // Calculate continuous increment (cumulative)
  const dailyIncrement = currentSum + lastSum;

  // Circular progress value for Increment (normalized between 0 and 1)
  const incrementPercent = Math.max(0, Math.min(1, dailyIncrement / 10));

  const router = useRouter();

  const loading = authLoading;

  if (loading) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Text style={styles.greetingText}>
            Welcome back, <Text style={styles.nameText}>{user?.firstname || "User"}</Text>
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={true}
        indicatorStyle="black"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.dashboardCard}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 24 }]}>
            Daily Water Consumption
          </Text>
          <View style={styles.chartContainer}>
            {/* Modern Circular Progress for Increment with value labels */}
            <View
              style={{
                alignItems: "center",
                marginVertical: 16,
                justifyContent: "center",
              }}
            >
              <View style={styles.chartWrapper}>
                <Svg width={220} height={220} style={{ transform: [{ rotate: "-90deg" }] }}>
                  {/* Background Circle */}
                  <Circle
                    cx={110}
                    cy={110}
                    r={90}
                    stroke={swimTheme.colors.border}
                    strokeWidth={20}
                    fill="transparent"
                  />
                  {/* Progress Circle */}
                  <Circle
                    cx={110}
                    cy={110}
                    r={90}
                    stroke={swimTheme.colors.primary}
                    strokeWidth={20}
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 90}`}
                    strokeDashoffset={2 * Math.PI * 90 * (1 - incrementPercent)}
                  />
                </Svg>
                <View style={styles.chartCenter}>
                  <Text style={styles.chartValue}>{dailyIncrement}L</Text>
                  <Text style={styles.chartLabel}>Increment</Text>
                </View>
              </View>
              <View style={styles.statsCard}>
                <Text style={styles.statsText}>
                  <Text style={{ color: swimTheme.colors.border }}>Last Reading:</Text>{" "}
                  <Text style={{ color: swimTheme.colors.primary, fontWeight: "bold" }}>
                    {lastSum}L
                  </Text>
                </Text>
                <Text
                  style={{
                    color: swimTheme.colors.text,
                    fontSize: 20,
                    fontWeight: "500",
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ color: swimTheme.colors.border }}>Current Reading:</Text>{" "}
                  <Text style={{ color: swimTheme.colors.primary, fontWeight: "bold" }}>
                    {currentSum}L
                  </Text>
                </Text>
                <Text style={styles.statsText}>
                  <Text style={{ color: swimTheme.colors.border }}>Cumulative Total:</Text>{" "}
                  <Text style={{ color: swimTheme.colors.primary, fontWeight: "bold" }}>
                    {dailyIncrement}L
                  </Text>
                </Text>
              </View>
            </View>
          </View>

          <Divider style={[styles.cardDivider, styles.sectionDivider]} />

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Device Information
          </Text>

          <View style={styles.devicesContainer}>
            {user?.device_number && (
              <View key={user.device_number} style={styles.deviceCard}>
                <View style={styles.deviceHeader}>
                  <Text style={styles.deviceTitle}>Water Meter Device</Text>
                  <View
                    style={[styles.deviceStatus, { backgroundColor: swimTheme.colors.primary }]}
                  />
                </View>
                <Divider style={{ marginVertical: 12 }} />
                <View style={styles.deviceInfo}>
                  <View style={styles.deviceRow}>
                    <Text variant="bodySmall" style={styles.deviceLabel}>
                      Device Number
                    </Text>
                    <Text variant="bodyMedium" style={styles.deviceValue}>
                      {user.device_number}
                    </Text>
                  </View>
                  <View style={styles.deviceRow}>
                    <Text variant="bodySmall" style={styles.deviceLabel}>
                      Device Name
                    </Text>
                    <Text variant="bodyMedium" style={styles.deviceValue}>
                      Water Meter Device
                    </Text>
                  </View>
                </View>
              </View>
            )}
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
      </ScrollView>

      <View style={styles.footer}>{/* Footer content if needed */}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  chartCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  chartValue: {
    color: swimTheme.colors.primary,
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 4,
  },
  chartLabel: {
    color: swimTheme.colors.text,
    fontSize: 22,
    fontWeight: "500",
  },
  statsCard: {
    marginTop: 32,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 28,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    alignSelf: "center",
    minWidth: 280,
  },
  statsText: {
    color: swimTheme.colors.text,
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 12,
    textAlign: "center",
  },
  devicesContainer: {
    marginTop: 16,
  },
  deviceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  deviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deviceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: swimTheme.colors.text,
  },
  deviceStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
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
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  greetingText: {
    color: swimTheme.colors.border,
    ...swimTheme.fonts.regular,
    fontSize: 18,
    flexShrink: 1,
  },
  nameText: {
    color: swimTheme.colors.text,
    ...swimTheme.fonts.bold,
    fontSize: 18,
    flexShrink: 1,
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
