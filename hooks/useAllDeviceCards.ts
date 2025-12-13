import { useMemo } from "react";
import { AzureData } from "../services/azureDataService";

export interface DeviceCardProps {
  deviceId: string;
  readings: AzureData[];
}

export function useAllDeviceCards(allDeviceData: AzureData[]): DeviceCardProps[] {
  return useMemo(() => {
    // Group readings by deviceId
    const deviceMap: Record<string, AzureData[]> = {};
    if (allDeviceData && Array.isArray(allDeviceData)) {
      allDeviceData.forEach((d: AzureData) => {
        if (!deviceMap[d.azureDeviceId]) deviceMap[d.azureDeviceId] = [];
        deviceMap[d.azureDeviceId].push(d);
      });
    }

    return Object.keys(deviceMap).map((deviceId) => ({
      deviceId,
      readings: deviceMap[deviceId],
    }));
  }, [allDeviceData]);
}
