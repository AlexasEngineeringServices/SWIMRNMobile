import { create } from "zustand";
import { WaterUsageData } from "../services/mockWaterUsageData";

interface WaterUsageState {
  usageHistory: WaterUsageData[];
  setUsageHistory: (data: WaterUsageData[]) => void;
  getDeviceReadings: (deviceId: string) => WaterUsageData[];
}

export const useWaterUsageStore = create<WaterUsageState>((set, get) => ({
  usageHistory: [],
  setUsageHistory: (data) => set({ usageHistory: data }),
  getDeviceReadings: (deviceId) => {
    return get().usageHistory.filter((entry) => entry.azureDeviceId === deviceId);
  },
}));
