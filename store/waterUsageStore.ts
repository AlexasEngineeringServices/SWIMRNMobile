import { create } from "zustand";
import { AzureData } from "../services/azureDataService";

interface WaterUsageState {
  usageHistory: AzureData[];
  setUsageHistory: (data: AzureData[]) => void;
  getDeviceReadings: (deviceId: string) => AzureData[];
}

export const useWaterUsageStore = create<WaterUsageState>((set, get) => ({
  usageHistory: [],
  setUsageHistory: (data) => set({ usageHistory: data }),
  getDeviceReadings: (deviceId) => {
    return get().usageHistory.filter((entry) => entry.azureDeviceId === deviceId);
  },
}));
