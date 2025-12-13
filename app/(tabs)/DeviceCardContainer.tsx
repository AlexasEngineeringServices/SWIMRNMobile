import { useRouter } from "expo-router";
import React from "react";
import { DashboardDeviceCard } from "../../components/DashboardDeviceCard";
import { useDeviceReadings } from "../../hooks/useDeviceReadings";
import { AzureData } from "../../services/azureDataService";

interface DeviceCardContainerProps {
  deviceId: string;
  readings: AzureData[];
}

const DeviceCardContainer: React.FC<DeviceCardContainerProps> = ({ deviceId, readings }) => {
  const stats = useDeviceReadings(readings);
  const latestReading = stats.latestReading;
  const isLatest = !!latestReading;
  const router = useRouter();

  const handleSwipe = () => {
    router.push({
      pathname: "../usage-history",
      params: { deviceId },
    });
  };

  if (!latestReading) return null;

  return (
    <DashboardDeviceCard
      key={deviceId}
      data={latestReading}
      isLatest={isLatest}
      onSwipe={handleSwipe}
    />
  );
};

export default DeviceCardContainer;
