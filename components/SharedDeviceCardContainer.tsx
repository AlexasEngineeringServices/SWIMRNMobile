import { useRouter } from "expo-router";
import React from "react";
import { useDeviceReadings } from "../hooks/useDeviceReadings";
import { AzureData } from "../services/azureDataService";
import { DashboardDeviceCard } from "./DashboardDeviceCard";

interface SharedDeviceCardContainerProps {
  deviceId: string;
  readings: AzureData[];
}

const SharedDeviceCardContainer: React.FC<SharedDeviceCardContainerProps> = ({
  deviceId,
  readings,
}) => {
  const stats = useDeviceReadings(readings);
  const latestReading = stats.latestReading;
  const isLatest = !!latestReading;
  const router = useRouter();

  const handleSwipe = () => {
    router.push({
      pathname: "/shared-usage-history",
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

export default SharedDeviceCardContainer;
