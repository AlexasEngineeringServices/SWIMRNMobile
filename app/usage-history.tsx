import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, ListRenderItem, StyleSheet, View } from "react-native";
import { Card, IconButton, List, SegmentedButtons, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import RouteGuard from "../components/RouteGuard";
import { Colors } from "../constants/theme";
import { AzureData, fetchAzureData } from "../services/azureDataService";
import { useAuthStore } from "../store/authStore";

type TimeFilter = "daily" | "weekly" | "monthly";

function UsageHistoryScreen() {
  const { deviceId } = useLocalSearchParams<{ deviceId?: string }>();
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState<AzureData[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("daily");

  // Fetch usage history
  const fetchUsageHistory = useCallback(async () => {
    try {
      setLoading(true);
      // Filter by device and user
      const data = await fetchAzureData(deviceId, user?.id);
      setUsageData(data);
    } catch (error) {
      console.error("Error fetching usage history:", error);
    } finally {
      setLoading(false);
    }
  }, [deviceId, user?.id]);

  const filterData = (data: AzureData[]) => {
    const now = moment.utc();
    switch (timeFilter) {
      case "daily":
        return data.filter((usage) => moment.utc(usage.enqueuedAt).isSame(now, "day"));
      case "weekly":
        return data.filter((usage) => moment.utc(usage.enqueuedAt).isSame(now, "week"));
      case "monthly":
        return data.filter((usage) => moment.utc(usage.enqueuedAt).isSame(now, "month"));
      default:
        return data;
    }
  };

  useEffect(() => {
    fetchUsageHistory();
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

  const Header = (
    <View style={{ backgroundColor: Colors.offWhite, marginBottom: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 8 }}>
        <IconButton
          icon="arrow-left"
          size={28}
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 4 }}
          accessibilityLabel="Go back"
        />
        <Text style={styles.title}>
          Water Usage History
          {deviceId ? ` (Device ${deviceId.replace("device-", "").padStart(3, "0")})` : ""}
        </Text>
      </View>
      <SegmentedButtons
        value={timeFilter}
        onValueChange={(value) => setTimeFilter(value as TimeFilter)}
        buttons={[
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
          { value: "monthly", label: "Monthly" },
        ]}
        theme={{
          colors: {
            secondaryContainer: Colors.mistGray,
            onSecondaryContainer: Colors.charcoal,
            primary: Colors.offWhite,
            onPrimary: Colors.deepSkyBlue,
            outline: Colors.mistGray,
          },
        }}
        density="medium"
        style={styles.segmentedButtons}
      />
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

  return (
    <RouteGuard>
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
          />
        )}
      </SafeAreaView>
    </RouteGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paleCyan,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    paddingHorizontal: 16,
    // paddingTop removed, handled by SafeAreaView and IconButton row
  },
  segmentedButtons: {
    marginBottom: 16,
    marginHorizontal: 16,
    elevation: 2,
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
    opacity: 0.5,
    marginTop: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
});

export default UsageHistoryScreen;
