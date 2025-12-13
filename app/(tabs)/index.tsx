import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import { useAllDeviceCards } from "../../hooks/useAllDeviceCards";
import { swimTheme } from "../../hooks/useCustomTheme";
import { AzureData, fetchAzureData } from "../../services/azureDataService";
import { useAuthStore } from "../../store/authStore";
import DeviceCardContainer from "./DeviceCardContainer";

export default function HomeScreen() {
  const { user, loading: authLoading } = useAuthStore();
  const deviceId = user?.device_number || "";

  const [allDeviceData, setAllDeviceData] = React.useState<AzureData[]>([]);

  useEffect(() => {
    async function fetchData() {
      // Fetch all device data for device cards
      const allData = await fetchAzureData();
      setAllDeviceData(allData);
    }
    fetchData();
  }, [deviceId]);

  // Use custom hook for all device cards
  const deviceCards = useAllDeviceCards(allDeviceData);

  console.log("Device Cards:", deviceCards);

  
  const [showInstructions, setShowInstructions] = React.useState(true);

  const loading = authLoading;

  if (loading) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={true}
        indicatorStyle="black"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.titleText}>Devices Readings</Text>
          </View>
        </View>

        {/* Device Information Card */}
        <View style={styles.devicesContainerCard}>
          {deviceCards.map(({ deviceId, readings }) => (
            <DeviceCardContainer key={deviceId} deviceId={deviceId} readings={readings} />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>{/* Footer content if needed */}</View>

      <Portal>
        <Dialog visible={showInstructions} onDismiss={() => setShowInstructions(false)}>
          <Dialog.Content>
            <View style={styles.instructionContent}>
              <MaterialCommunityIcons name="gesture-swipe-right" size={40} color={swimTheme.colors.primary} />
              <Text style={styles.instructionTitle}>Quick Tip</Text>
              <Text style={styles.instructionText}>
                Swipe any device card right to view its detailed usage history
              </Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button mode="contained" onPress={() => setShowInstructions(false)}>
              Got it
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  instructionContent: {
    alignItems: "center",
    paddingVertical: 16,
  },
  instructionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: swimTheme.colors.text,
    marginVertical: 12,
  },
  instructionText: {
    fontSize: 16,
    color: swimTheme.colors.text,
    textAlign: "center",
    lineHeight: 24,
  },
  deviceCardRedesign: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderTopWidth: 8,
    borderTopColor: swimTheme.colors.primary,
  },
  deviceHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  deviceTitleRedesign: {
    fontSize: 20,
    fontWeight: "600",
    color: swimTheme.colors.text,
  },
  deviceDateRedesign: {
    fontSize: 14,
    color: swimTheme.colors.border,
    marginBottom: 4,
  },
  notTodayText: {
    fontSize: 14,
    color: swimTheme.colors.border,
    marginBottom: 12,
    fontStyle: "italic",
  },
  metricsContainer: {
    marginTop: 12,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metricBox: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 14,
    color: swimTheme.colors.border,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "600",
    color: swimTheme.colors.primary,
  },
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
    marginVertical: 8,
    paddingHorizontal: 2,
    backgroundColor: swimTheme.colors.background,
  },
  titleSection: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    color: swimTheme.colors.primary,
  },
  titleText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    color: swimTheme.colors.primary,
    alignSelf: "center",
    textAlign: "center",
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
  chartContainerCard: {
    backgroundColor: swimTheme.colors.card,
    borderRadius: 16,
    marginBottom: 20,
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
  devicesContainerCard: {
    borderRadius: 16,
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
