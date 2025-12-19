import { useLocalSearchParams, useRouter } from "expo-router";
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
  const params = useLocalSearchParams<{ token?: string }>();
  const stats = useDeviceReadings(readings);
  const latestReading = stats.latestReading;
  const isLatest = !!latestReading;
  const router = useRouter();

  const handleSwipe = () => {
    // Pass the encrypted user ID token from the URL to the usage history page
    router.push({
      pathname: "/shared-usage-history",
      params: { 
        deviceId,
        userId: params.token // Pass the encrypted token as userId
      },
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
