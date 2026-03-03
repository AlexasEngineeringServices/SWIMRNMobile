import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, ListRenderItem, Platform, StyleSheet, View } from "react-native";
import { Card, IconButton, List, SegmentedButtons, Text } from "react-native-paper";
import { DatePickerInput } from "react-native-paper-dates";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";
import { AzureData, fetchAzureData } from "../services/azureDataService";
import { decryptUserId } from "../utils/encryption";

type FilterMode = "all" | "dateRange";

function SharedUsageHistory() {
  const { deviceId, userId: encryptedUserId } = useLocalSearchParams<{
    deviceId?: string;
    userId?: string;
  }>();
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState<AzureData[]>([]);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Only show on web
  useEffect(() => {
    if (Platform.OS !== "web") {
      setLoading(false);
    }
  }, []);

  // Fetch usage history
  const fetchUsageHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Decrypt user ID from URL parameter (now async)
      const userId = encryptedUserId ? await decryptUserId(encryptedUserId) : null;

      if (!userId) {
        // Show a specific message if the JWT is expired
        setError(
          "This link has expired. For your security, shared links are only valid for 7 days. Please request a new link from the owner."
        );
        setLoading(false);
        return;
      }

      // Fetch data filtered by device and user
      const data = await fetchAzureData(deviceId, userId);
      setUsageData(data);
    } catch (error) {
      console.error("Error fetching usage history:", error);
      setError("Failed to load usage history");
    } finally {
      setLoading(false);
    }
  }, [deviceId, encryptedUserId]);

  const filterData = (data: AzureData[]) => {
    if (filterMode === "all") return data;

    if (filterMode === "dateRange") {
      // Keep list visible until both dates are chosen
      if (!fromDate || !toDate) return data;

      const [startDate, endDate] = fromDate <= toDate ? [fromDate, toDate] : [toDate, fromDate];
      const from = moment.utc(startDate).startOf("day");
      const to = moment.utc(endDate).endOf("day");

      return data.filter((usage) => {
        const usageDate = moment.utc(usage.enqueuedAt);
        return usageDate.isBetween(from, to, undefined, "[]");
      });
    }

    return [];
  };

  useEffect(() => {
    if (Platform.OS === "web") {
      fetchUsageHistory();
    }
  }, [fetchUsageHistory]);

  const renderItem: ListRenderItem<AzureData> = ({ item: usage }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.dateText}>
          {moment.utc(usage.enqueuedAt).format("MMM DD, YYYY HH:mm")}
        </Text>
        <List.Section>
          <List.Item
            title="Round Bottles"
            description={`Count: ${usage.roundCount} | Void: ${usage.roundVoidCount}`}
            left={(props) => <List.Icon {...props} icon="bottle-tonic" />}
          />
          <List.Item
            title="Slim Bottles"
            description={`Count: ${usage.slimCount} | Void: ${usage.slimVoidCount}`}
            left={(props) => <List.Icon {...props} icon="bottle-tonic-outline" />}
          />
        </List.Section>
        <Text style={styles.deviceText}>Device ID: {usage.azureDeviceId}</Text>
      </Card.Content>
    </Card>
  );

  const handleGoBack = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  const Header = (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        <IconButton
          icon="arrow-left"
          size={28}
          onPress={handleGoBack}
          style={{ marginLeft: 4 }}
          accessibilityLabel="Go back"
        />
        <Text style={styles.title}>
          Water Usage History
          {deviceId ? ` (Device ${deviceId.replace("device-", "").padStart(3, "0")})` : ""}
        </Text>
      </View>

      <Text style={styles.subtitle}>Public Dashboard - View Only</Text>

      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Filter:</Text>
        <SegmentedButtons
          value={filterMode}
          onValueChange={(value) => setFilterMode(value as FilterMode)}
          buttons={[
            { value: "all", label: "All" },
            { value: "dateRange", label: "Date" },
          ]}
          density="medium"
          style={styles.filterSegmented}
          theme={{
            colors: {
              secondaryContainer: Colors.mistGray,
              onSecondaryContainer: Colors.charcoal,
              outline: Colors.mistGray,
            },
          }}
        />

        {filterMode === "dateRange" && (
          <View style={styles.datePickerSection}>
            <DatePickerInput
              label="From (MM/DD/YYYY)"
              value={fromDate ?? undefined}
              onChange={(date) => setFromDate(date ?? null)}
              inputMode="start"
              style={styles.datePicker}
              locale="en"
              theme={{
                colors: {
                  background: "#fff",
                  onSurface: Colors.charcoal,
                  primary: Colors.deepSkyBlue,
                },
              }}
              textColor={Colors.charcoal}
            />
            <DatePickerInput
              label="To (MM/DD/YYYY)"
              value={toDate ?? undefined}
              onChange={(date) => setToDate(date ?? null)}
              inputMode="end"
              style={styles.datePicker}
              locale="en"
              theme={{
                colors: {
                  background: "#fff",
                  onSurface: Colors.charcoal,
                  primary: Colors.deepSkyBlue,
                },
              }}
              textColor={Colors.charcoal}
            />
          </View>
        )}
      </View>
    </View>
  );

  const renderSkeleton = () => (
    <>
      {[...Array(3)].map((_, idx) => (
        <Card key={idx} style={styles.card}>
          <Card.Content>
            <View
              style={{
                height: 18,
                width: 120,
                backgroundColor: Colors.mistGray,
                borderRadius: 8,
                marginBottom: 12,
                opacity: 0.5,
              }}
            />
            <View
              style={{
                height: 14,
                width: 180,
                backgroundColor: Colors.mistGray,
                borderRadius: 8,
                marginBottom: 8,
                opacity: 0.4,
              }}
            />
            <View
              style={{
                height: 14,
                width: 140,
                backgroundColor: Colors.mistGray,
                borderRadius: 8,
                marginBottom: 8,
                opacity: 0.4,
              }}
            />
            <View
              style={{
                height: 10,
                width: 80,
                backgroundColor: Colors.mistGray,
                borderRadius: 8,
                marginBottom: 8,
                opacity: 0.3,
              }}
            />
          </Card.Content>
        </Card>
      ))}
    </>
  );

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

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>Please check your link and try again.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {Header}
      {loading ? (
        <View style={{ marginTop: 16 }}>{renderSkeleton()}</View>
      ) : (
        <FlatList
          data={filterData(usageData)}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.enqueuedAt}-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
          refreshing={loading}
          onRefresh={fetchUsageHistory}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="water-off"
                size={80}
                color={Colors.mistGray}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>No Usage Data</Text>
              <Text style={styles.emptyText}>
                No usage history found for the selected time period.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paleCyan,
  },
  headerContainer: {
    backgroundColor: Colors.offWhite,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    paddingHorizontal: 16,
    color: Colors.charcoal,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.charcoal,
    marginBottom: 16,
    paddingHorizontal: 16,
    textAlign: "center",
  },
  filterSection: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "#f0f4f8",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.charcoal,
    marginBottom: 8,
  },
  filterSegmented: {
    marginBottom: 10,
  },
  datePickerSection: {
    flexDirection: "column",
    gap: 8,
  },
  datePicker: {
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  dateText: {
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.7,
  },
  deviceText: {
    fontSize: 12,
    marginTop: 8,
    opacity: 0.5,
  },
  listContent: {
    paddingBottom: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.charcoal,
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: Colors.charcoal,
    textAlign: "center",
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 24,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.charcoal,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: Colors.mistGray,
    textAlign: "center",
    lineHeight: 24,
  },
});

export default SharedUsageHistory;
