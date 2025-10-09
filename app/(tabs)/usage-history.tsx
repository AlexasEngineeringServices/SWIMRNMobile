import moment from "moment";
import React, { useEffect, useState } from "react";
import { FlatList, ListRenderItem, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Card,
  List,
  SegmentedButtons,
  Text,
  useTheme,
} from "react-native-paper";
import { Colors } from "../../constants/theme";

interface WaterUsageData {
  roundCount: number;
  slimCount: number;
  roundVoidCount: number;
  slimVoidCount: number;
  enqueuedAt: string;
  azureDeviceId: string;
}

// Mock API data
const mockWaterUsageData: WaterUsageData[] = [
  // Today's data
  {
    roundCount: 5,
    slimCount: 3,
    roundVoidCount: 2.5,
    slimVoidCount: 1.5,
    enqueuedAt: new Date(2025, 9, 9, 14, 30).toISOString(),
    azureDeviceId: "device-001",
  },
  {
    roundCount: 4,
    slimCount: 2,
    roundVoidCount: 1.8,
    slimVoidCount: 1.2,
    enqueuedAt: new Date(2025, 9, 9, 10, 15).toISOString(),
    azureDeviceId: "device-001",
  },
  // Yesterday's data
  {
    roundCount: 3,
    slimCount: 2,
    roundVoidCount: 1.5,
    slimVoidCount: 1.0,
    enqueuedAt: new Date(2025, 9, 8, 15, 45).toISOString(),
    azureDeviceId: "device-001",
  },
  // Last week's data
  {
    roundCount: 6,
    slimCount: 4,
    roundVoidCount: 3.0,
    slimVoidCount: 2.0,
    enqueuedAt: new Date(2025, 9, 2, 9, 30).toISOString(),
    azureDeviceId: "device-001",
  },
  // Last month's data
  {
    roundCount: 7,
    slimCount: 5,
    roundVoidCount: 3.5,
    slimVoidCount: 2.5,
    enqueuedAt: new Date(2025, 8, 15, 11, 20).toISOString(),
    azureDeviceId: "device-001",
  },
];

type TimeFilter = "daily" | "weekly" | "monthly";

export default function UsageHistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState<WaterUsageData[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("daily");
  const theme = useTheme();

  const filterData = (data: WaterUsageData[]) => {
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
    // Simulate API call
    const fetchUsageHistory = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setUsageData(mockWaterUsageData);
      } catch (error) {
        console.error("Error fetching usage history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageHistory();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderItem: ListRenderItem<WaterUsageData> = ({ item: usage }) => (
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
      <Text style={styles.title}>Water Usage History</Text>
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
            secondaryContainer: Colors.mistGray, // gray for unselected
            onSecondaryContainer: Colors.charcoal, // dark text for unselected
            primary: Colors.offWhite, // white for selected
            onPrimary: Colors.deepSkyBlue, // blue text for selected
            outline: Colors.mistGray,
          },
        }}
        density="medium"
        style={styles.segmentedButtons}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {Header}
      <FlatList
        data={filterData(usageData)}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.enqueuedAt}-${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paleCyan,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.paleCyan,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
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
