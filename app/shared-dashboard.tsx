import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import SharedDeviceCardContainer from "../components/SharedDeviceCardContainer";
import { useAllDeviceCards } from "../hooks/useAllDeviceCards";
import { swimTheme } from "../hooks/useCustomTheme";
import { AzureData, fetchAzureData } from "../services/azureDataService";

export default function SharedDashboard() {
  const [allDeviceData, setAllDeviceData] = React.useState<AzureData[]>([]);
  const [showInstructions, setShowInstructions] = React.useState(true);
  const [loading, setLoading] = React.useState(true);

  // Redirect if not on web
  useEffect(() => {
    if (Platform.OS !== "web") {
      // You can handle this as needed - for now, just don't render
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch all device data for device cards (no authentication required)
        const allData = await fetchAzureData();
        setAllDeviceData(allData);
      } catch (error) {
        console.error("Error fetching device data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (Platform.OS === "web") {
      fetchData();
    }
  }, []);

  // Use custom hook for all device cards
  const deviceCards = useAllDeviceCards(allDeviceData);

  // Only show on web
  if (Platform.OS !== "web") {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>This page is only available on web.</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading device data...</Text>
        </View>
      </View>
    );
  }

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
            <Text style={styles.subtitleText}>Public Dashboard - View Only</Text>
          </View>
        </View>

        {/* Device Information Card */}
        <View style={styles.devicesContainerCard}>
          {deviceCards.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No device data available</Text>
            </View>
          ) : (
            deviceCards.map(({ deviceId, readings }) => (
              <SharedDeviceCardContainer key={deviceId} deviceId={deviceId} readings={readings} />
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by SWIM App</Text>
      </View>

      <Portal>
        <Dialog 
          visible={showInstructions} 
          onDismiss={() => setShowInstructions(false)}
          style={styles.dialog}
        >
          <Dialog.Content style={styles.dialogContent}>
            <View style={styles.instructionContent}>
              <MaterialCommunityIcons
                name="gesture-swipe-right"
                size={40}
                color={swimTheme.colors.primary}
              />
              <Text style={styles.instructionTitle}>Quick Tip</Text>
              <Text style={styles.instructionText}>
                Swipe any device card right to view its detailed usage history
              </Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
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
    alignItems: "center",
  },
  titleText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: swimTheme.colors.primary,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 16,
    color: swimTheme.colors.border,
    textAlign: "center",
    marginBottom: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  devicesContainerCard: {
    borderRadius: 16,
    overflow: 'hidden',
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
  footer: {
    padding: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: swimTheme.colors.border,
  },
  dialog: {
    backgroundColor: "#fff",
    borderRadius: 16,
    maxWidth: 400,
    alignSelf: "center",
    overflow: 'hidden',
  },
  dialogContent: {
    backgroundColor: "#fff",
    paddingVertical: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  dialogActions: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  instructionContent: {
    alignItems: "center",
    paddingVertical: 16,
  },
  instructionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
    marginVertical: 12,
  },
  instructionText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: swimTheme.colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: swimTheme.colors.text,
    textAlign: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: swimTheme.colors.border,
  },
});
