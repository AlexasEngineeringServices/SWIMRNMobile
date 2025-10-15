export interface WaterUsageData {
  roundCount: number;
  slimCount: number;
  roundVoidCount: number;
  slimVoidCount: number;
  enqueuedAt: string;
  azureDeviceId: string;
}

export const mockWaterUsageData: WaterUsageData[] = [
  // Today's data (Oct 15)
  {
    roundCount: 8,
    slimCount: 4,
    roundVoidCount: 3.0,
    slimVoidCount: 2.0,
    enqueuedAt: new Date(2025, 9, 15, 14, 30).toISOString(),
    azureDeviceId: "device-001",
  },
  {
    roundCount: 5,
    slimCount: 3,
    roundVoidCount: 2.5,
    slimVoidCount: 1.5,
    enqueuedAt: new Date(2025, 9, 15, 9, 15).toISOString(),
    azureDeviceId: "device-001",
  },
  // Oct 11 data
  {
    roundCount: 7,
    slimCount: 4,
    roundVoidCount: 3.0,
    slimVoidCount: 2.0,
    enqueuedAt: new Date(2025, 9, 11, 16, 45).toISOString(),
    azureDeviceId: "device-001",
  },
  {
    roundCount: 6,
    slimCount: 3,
    roundVoidCount: 2.5,
    slimVoidCount: 1.5,
    enqueuedAt: new Date(2025, 9, 11, 13, 30).toISOString(),
    azureDeviceId: "device-001",
  },
  {
    roundCount: 4,
    slimCount: 2,
    roundVoidCount: 1.8,
    slimVoidCount: 1.2,
    enqueuedAt: new Date(2025, 9, 11, 9, 15).toISOString(),
    azureDeviceId: "device-001",
  },
];
