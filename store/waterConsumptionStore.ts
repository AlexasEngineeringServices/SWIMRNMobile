import { create } from "zustand";

interface WaterConsumption {
  id: string;
  userId: string;
  deviceId: string;
  consumptionAmount: number;
  consumptionDate: Date;
}

interface WaterConsumptionState {
  dailyTarget: number;
  consumed: number;
  dailyGoal: number;
  loading: boolean;
  error: string | null;
  updateConsumption: (amount: number) => void;
  fetchDailyStats: () => Promise<void>;
}

// Mock data for development
const mockWaterData = {
  dailyTarget: 2000,
  consumed: 1500,
  dailyGoal: 75,
};

export const useWaterConsumptionStore = create<WaterConsumptionState>((set) => ({
  dailyTarget: 0,
  consumed: 0,
  dailyGoal: 0,
  loading: false,
  error: null,

  updateConsumption: (amount: number) => {
    set((state) => {
      const newConsumed = state.consumed + amount;
      const newDailyGoal = Math.min(Math.round((newConsumed / state.dailyTarget) * 100), 100);
      return {
        consumed: newConsumed,
        dailyGoal: newDailyGoal,
      };
    });
  },

  fetchDailyStats: async () => {
    set({ loading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      set({
        dailyTarget: mockWaterData.dailyTarget,
        consumed: mockWaterData.consumed,
        dailyGoal: mockWaterData.dailyGoal,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch water consumption data",
        loading: false,
      });
    }
  },
}));
