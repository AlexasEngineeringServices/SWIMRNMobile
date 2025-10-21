import { MaterialCommunityIcons } from "@expo/vector-icons";
import moment from "moment";
import React, { useEffect } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { swimTheme } from "../hooks/useCustomTheme";
import { WaterUsageData } from "../services/mockWaterUsageData";
import SwipeGesture from "./SwipeGesture";

interface DeviceCardProps {
  data: WaterUsageData;
  isToday: boolean;
  onSwipe: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ data, isToday, onSwipe }) => {
  const hintOpacity = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade out the hint after 3 seconds
    const timer = setTimeout(() => {
      Animated.timing(hintOpacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleSwipe = (direction: string) => {
    if (direction === "left" || direction === "right") {
      onSwipe();
    }
  };

  return (
    <SwipeGesture onSwipePerformed={handleSwipe} gestureStyle={styles.gestureContainer}>
      <View style={styles.deviceCard}>
        <View style={styles.deviceHeader}>
          <Text style={styles.deviceTitle}>
            Device {data.azureDeviceId.replace("device-", "").padStart(3, "0")}
          </Text>
          <Animated.View style={[styles.swipeHintContainer, { opacity: hintOpacity }]}>
            <MaterialCommunityIcons
              name="gesture-swipe-horizontal"
              size={20}
              color={swimTheme.colors.border}
            />
            <Text style={styles.swipeHintText}>Swipe to view history</Text>
          </Animated.View>
        </View>
        <Text style={styles.dateText}>
          Latest (UTC): {moment.utc(data.enqueuedAt).format("YYYY-MM-DD HH:mm:ss")}
        </Text>
        {!isToday && <Text style={styles.notToday}>Not today</Text>}
        <View style={styles.metricsContainer}>
          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Round Δ</Text>
              <Text style={styles.metricValue}>{data.roundCount}</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Slim Δ</Text>
              <Text style={styles.metricValue}>{data.slimCount}</Text>
            </View>
          </View>
          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Round Void Δ</Text>
              <Text style={styles.metricValue}>{data.roundVoidCount}</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Slim Void Δ</Text>
              <Text style={styles.metricValue}>{data.slimVoidCount}</Text>
            </View>
          </View>
        </View>
      </View>
    </SwipeGesture>
  );
};

const styles = StyleSheet.create({
  gestureContainer: {
    marginBottom: 16,
    width: "100%",
  },
  deviceCard: {
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
  deviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  swipeHintContainer: {
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.7,
  },
  swipeHintText: {
    fontSize: 12,
    color: swimTheme.colors.border,
    marginLeft: 4,
  },
  deviceTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: swimTheme.colors.text,
  },
  dateText: {
    fontSize: 14,
    color: swimTheme.colors.border,
    marginBottom: 4,
  },
  notToday: {
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
});
